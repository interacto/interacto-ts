/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {CommandBase} from "../../src/impl/command/CommandBase";
import type {Binding} from "../../src/api/binding/Binding";
import type {Interaction} from "../../src/api/interaction/Interaction";
import type {InteractionData} from "../../src/api/interaction/InteractionData";
import {Subject} from "rxjs";
import {flushPromises} from "../Utils";
import {robot} from "../interaction/StubEvents";
import type {BindingImpl} from "../../src/impl/binding/BindingImpl";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import {BindingsImpl} from "../../src/impl/binding/BindingsImpl";
import type {UndoHistoryBase} from "../../src/api/undo/UndoHistoryBase";
import {UndoHistoryImpl} from "../../src/impl/undo/UndoHistoryImpl";
import useFakeTimers = jest.useFakeTimers;
import clearAllTimers = jest.clearAllTimers;
import useRealTimers = jest.useRealTimers;
import runAllTimers = jest.runAllTimers;
import advanceTimersByTime = jest.advanceTimersByTime;
import fn = jest.fn;
import clearAllMocks = jest.clearAllMocks;

class Model {
    public data: Array<string> = ["Foo", "Bar", "Yo"];
}

class StubAsyncCmd extends CommandBase {
    public readonly data: Model;

    public readonly timeout: number;

    public readonly accept: boolean;

    public constructor(data: Model, timeout = 20, resolve = true) {
        super();
        this.data = data;
        this.timeout = timeout;
        this.accept = resolve;
    }

    protected execution(): Promise<void> | void {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    if (this.accept) {
                        this.data.data.pop();
                        resolve();
                    } else {
                        reject(new Error("Invalid request"));
                    }
                }, this.timeout);
            }
        );
    }

    public override hadEffect(): boolean {
        return super.hadEffect() && this.accept;
    }
}

let cmd: StubAsyncCmd;
let data: Model;
let binding: Binding<StubAsyncCmd, Interaction<InteractionData>, InteractionData, unknown> | undefined;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("testing async commands and bindings", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        data = new Model();
        cmd = new StubAsyncCmd(data);
    });

    afterEach(async () => {
        bindings.clear();
        clearAllTimers();
        clearAllMocks();
        await flushPromises();
    });

    describe("async command alone", () => {
        test("when promise not ended command not ended", () => {
            useFakeTimers();
            const res = cmd.execute();

            expect(res).toBeDefined();
            expect(cmd.getStatus()).toBe("created");
            expect(data.data).toStrictEqual(["Foo", "Bar", "Yo"]);
        });

        test("when promise ended command also ended", async () => {
            useRealTimers();
            const res = await cmd.execute();

            expect(res).toBeDefined();
            expect(cmd.getStatus()).toBe("executed");
            expect(data.data).toStrictEqual(["Foo", "Bar"]);
        });

        test("two commands executed", async () => {
            useRealTimers();
            const cmd2 = new StubAsyncCmd(data);
            await Promise.all([cmd.execute(), cmd2.execute()]);

            expect(data.data).toStrictEqual(["Foo"]);
        });
    });

    describe("async with a standard binding", () => {
        let button1: HTMLButtonElement;

        beforeEach(() => {
            useFakeTimers();
            button1 = document.createElement("button");
        });

        test("button binding with async command works", async () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data, 20))
                .on(button1)
                .bind();

            button1.click();
            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(binding.command).toBeUndefined();
            expect(ctx.commands).toHaveLength(1);
            expect(ctx.commands[0].getStatus()).toBe("done");
            expect(data.data).toStrictEqual(["Foo", "Bar"]);
        });

        test("button binding with async command does not end when the command is not disposed", async () => {
            const end = jest.fn(() => {});
            const first = jest.fn(() => {});
            binding = bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data, 50))
                .on(button1)
                .end(end)
                .first(first)
                .bind();

            button1.click();
            advanceTimersByTime(49);
            await flushPromises();
            expect(binding.command).toBeDefined();
            expect(end).not.toHaveBeenCalled();
            expect(first).toHaveBeenCalledTimes(1);
            expect(data.data).toStrictEqual(["Foo", "Bar", "Yo"]);
        });

        test("button binding with async command ends when the command is disposed", async () => {
            const end = jest.fn(() => {});
            const first = jest.fn(() => {});
            binding = bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data, 50))
                .on(button1)
                .end(end)
                .first(first)
                .bind();

            button1.click();
            advanceTimersByTime(51);
            await flushPromises();
            expect(binding.command).toBeUndefined();
            expect(end).toHaveBeenCalledTimes(1);
            expect(first).toHaveBeenCalledTimes(1);
        });

        test("two button clicks with async command work in good time order (1)", async () => {
            binding = bindings.buttonBinder()
                .toProduce(fn()
                    .mockReturnValueOnce(new StubAsyncCmd(data, 100))
                    .mockReturnValueOnce(new StubAsyncCmd(data, 5)))
                .on(button1)
                .bind();

            button1.click();
            button1.click();
            advanceTimersByTime(10);
            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(binding.command).toBeUndefined();
            expect(ctx.commands).toHaveLength(2);
            expect(ctx.commands[0].getStatus()).toBe("done");
            expect(ctx.commands[1].getStatus()).toBe("done");
            expect(ctx.getCmd<StubAsyncCmd>(0)?.timeout).toBe(5);
            expect(ctx.getCmd<StubAsyncCmd>(1)?.timeout).toBe(100);
            expect(data.data).toStrictEqual(["Foo"]);
        });

        test("two button clicks with async command work in good time order (2)", async () => {
            binding = bindings.buttonBinder()
                .toProduce(fn()
                    .mockReturnValueOnce(new StubAsyncCmd(data, 5))
                    .mockReturnValueOnce(new StubAsyncCmd(data, 100)))
                .on(button1)
                .bind();

            button1.click();
            button1.click();
            advanceTimersByTime(10);
            runAllTimers();
            await flushPromises();

            expect(binding.command).toBeUndefined();
            expect(ctx.commands).toHaveLength(2);
            expect(ctx.getCmd<StubAsyncCmd>(0)?.timeout).toBe(5);
            expect(ctx.getCmd<StubAsyncCmd>(1)?.timeout).toBe(100);
            expect(data.data).toStrictEqual(["Foo"]);
        });

        test("two button clicks with async command, first/end ok when waiting ongoing cmd", async () => {
            cmd = new StubAsyncCmd(data, 50);
            const cmd2 = new StubAsyncCmd(data, 5);
            const end = jest.fn(() => {});
            const first = jest.fn(() => {});

            binding = bindings.buttonBinder()
                .toProduce(fn()
                    .mockReturnValueOnce(cmd)
                    .mockReturnValueOnce(cmd2))
                .end(end)
                .first(first)
                .on(button1)
                .bind();

            button1.click();
            runAllTimers();
            button1.click();
            runAllTimers();
            await flushPromises();

            expect(first).toHaveBeenCalledTimes(2);
            expect(end).toHaveBeenNthCalledWith(1, cmd, expect.anything(), {});
            expect(end).toHaveBeenNthCalledWith(2, cmd2, expect.anything(), {});
            expect(end).toHaveBeenCalledTimes(2);
            expect(end).toHaveBeenNthCalledWith(1, cmd, expect.anything(), {});
            expect(end).toHaveBeenNthCalledWith(2, cmd2, expect.anything(), {});
        });

        test("two button clicks with async command, first/end ok when not waiting ongoing cmd", async () => {
            cmd = new StubAsyncCmd(data, 100);
            const cmd2 = new StubAsyncCmd(data, 50);
            const end = jest.fn(() => {});
            const first = jest.fn(() => {});

            binding = bindings.buttonBinder()
                .toProduce(fn()
                    .mockReturnValueOnce(cmd)
                    .mockReturnValueOnce(cmd2))
                .end(end)
                .first(first)
                .on(button1)
                .bind();

            button1.click();
            advanceTimersByTime(40);
            button1.click();
            // Triggering the command cmd2
            advanceTimersByTime(20);
            // Triggering the command cmd
            runAllTimers();
            await flushPromises();

            expect(first).toHaveBeenCalledTimes(2);
            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(2);
            expect(end).toHaveBeenCalledTimes(2);
            expect(end).toHaveBeenNthCalledWith(1, cmd2, expect.anything(), {});
            expect(end).toHaveBeenNthCalledWith(2, cmd, expect.anything(), {});
        });

        test("button binding with async command that rejects works", async () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data, 20, false))
                .on(button1)
                .bind();

            button1.click();
            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(binding.timesEnded).toBe(1);
            expect(binding.command).toBeUndefined();
            expect(ctx.commands).toHaveLength(1);
        });

        test("button binding with async command OK when 'end' crashes", async () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data))
                .on(button1)
                .bind();

            // Need to provoke an error. So closing a stream
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            (binding as unknown).cmdsProduced.unsubscribe();
            button1.click();
            runAllTimers();
            await flushPromises();

            // Need to reopen the stream not to provoke crash on flush
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            (binding as unknown).cmdsProduced = new Subject();

            expect(binding).toBeDefined();
            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(1);
            expect(ctx.commands).toHaveLength(0);
        });

        test("button deactivated on command production", () => {
            bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data))
                .first(() => {
                    button1.disabled = true;
                })
                .end(() => {
                    button1.disabled = false;
                })
                .on(button1)
                .bind();

            button1.click();
            jest.advanceTimersByTime(49);
            expect(button1.disabled).toBeTruthy();
        });

        test("button deactivated and then activated", async () => {
            bindings.buttonBinder()
                .toProduce(() => new StubAsyncCmd(data))
                .first(() => {
                    button1.disabled = true;
                })
                .end(() => {
                    button1.disabled = false;
                })
                .on(button1)
                .bind();

            button1.click();
            button1.click();
            runAllTimers();
            await flushPromises();
            expect(button1.disabled).toBeFalsy();
            expect(ctx.commands).toHaveLength(1);
        });
    });

    describe("async with a dnd binding", () => {
        let canvas: HTMLCanvasElement;

        beforeEach(() => {
            useFakeTimers();
            canvas = document.createElement("canvas");
        });

        test("dnd binding with async command OK when 'end' crashes", async () => {
            binding = bindings.dndBinder(false)
                .toProduce(() => new StubAsyncCmd(data))
                .on(canvas)
                .bind();

            robot(canvas)
                .mousedown()
                .mousemove()
                .mouseup();

            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(1);
            expect(ctx.commands).toHaveLength(1);
        });

        test("dnd binding with async command and continuous execution", async () => {
            const cannot = jest.fn(() => {});

            binding = bindings.dndBinder(false)
                .toProduce(() => new StubAsyncCmd(data))
                .on(canvas)
                .continuousExecution()
                .log("command")
                .ifCannotExecute(cannot)
                .bind();

            robot(canvas)
                .mousedown()
                .mousemove()
                .mousemove()
                .mousemove()
                .mouseup();

            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(1);
            expect(ctx.commands).toHaveLength(1);
            expect(cannot).not.toHaveBeenCalled();
            expect(data.data).toHaveLength(0);
        });

        test("dnd binding with async command and continuous execution with no log", async () => {
            const cannot = jest.fn(() => {});

            binding = bindings.dndBinder(false)
                .toProduce(() => new StubAsyncCmd(data))
                .on(canvas)
                .continuousExecution()
                .ifCannotExecute(cannot)
                .bind();

            robot(canvas)
                .mousedown()
                .mousemove()
                .mousemove()
                .mouseup();

            runAllTimers();
            await flushPromises();

            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(1);
            expect(ctx.commands).toHaveLength(1);
            expect(cannot).not.toHaveBeenCalled();
            expect(data.data).toHaveLength(0);
        });

        test("dnd binding with async command and continuous execution and crash", async () => {
            const cannot = jest.fn(() => {});

            binding = bindings.dndBinder(false)
                .toProduce(() => new StubAsyncCmd(data, 50, false))
                .on(canvas)
                .continuousExecution()
                .ifCannotExecute(cannot)
                .log("command")
                .bind();

            jest.spyOn(binding as BindingImpl<StubAsyncCmd, Interaction<InteractionData>, InteractionData, unknown>,
                "ifCannotExecuteCmd").mockImplementation(() => {
                throw new Error("Error");
            });

            robot(canvas)
                .mousedown()
                .mousemove()
                .mouseup();

            runAllTimers();
            await flushPromises();

            expect(binding.command).toBeUndefined();
            expect(binding.timesEnded).toBe(1);
            expect(ctx.commands).toHaveLength(0);
            expect(data.data).toStrictEqual(["Foo", "Bar", "Yo"]);
        });
    });

    describe("async with a multi-touch binding (recycling events)", () => {
        let canvas: HTMLCanvasElement;

        beforeEach(() => {
            useFakeTimers();
            canvas = document.createElement("canvas");
        });

        test("button binding with async command OK when 'end' crashes", async () => {
            binding = bindings.multiTouchBinder(2)
                .toProduce(() => new StubAsyncCmd(data))
                .on(canvas)
                .bind();

            robot(canvas)
                .touchstart({}, [{"identifier": 1}])
                .touchstart({}, [{"identifier": 2}])
                .touchmove({}, [{"identifier": 2}])
                .touchend({}, [{"identifier": 2}])
                .touchstart({}, [{"identifier": 3}])
                .touchmove({}, [{"identifier": 3}])
                .touchend({}, [{"identifier": 1}]);

            runAllTimers();
            await flushPromises();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(2);
        });
    });
});

