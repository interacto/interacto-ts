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

import type {Binding, EltRef, Interaction, InteractionData, UndoHistoryBase} from "../../src/interacto";
import {BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";

let button1: HTMLButtonElement;
let button2: HTMLButtonElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("using a button binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        button1 = document.createElement("button");
        button2 = document.createElement("button");
        cmd = new StubCmd(true);
    });

    afterEach(() => {
        bindings.clear();
    });

    test("commandExecutedOnSingleButtonConsumer", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .on(button1)
            .bind();

        button1.click();
        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(1);
        expect(ctx.commands).toHaveLength(1);
        expect(ctx.commands[0]).toBe(cmd);
    });

    test("commandExecutedOnSingleButtonConsumerConsumer", () => {
        binding = bindings.buttonBinder()
            .on(button1)
            .toProduce(_i => cmd)
            .bind();

        button1.click();
        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(1);
    });

    test("commandExecutedOnTwoButtons", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on(button1, button2)
            .bind();

        button2.click();
        button1.click();

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(2);
        expect(ctx.getCmd(0)).not.toBe(ctx.getCmd(1));
        expect(ctx.getCmd<StubCmd>(0).exec).toBe(1);
        expect(ctx.getCmd<StubCmd>(1).exec).toBe(1);
    });

    test("command executed on two buttons with one array", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on([button1, button2])
            .bind();

        button2.click();
        button1.click();

        expect(ctx.commands).toHaveLength(2);
    });

    test("command executed on two buttons with one ElementRef", () => {
        const eltRef: EltRef<EventTarget> = {
            "nativeElement": button1
        };

        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on(eltRef, button2)
            .bind();

        button2.click();
        button1.click();

        expect(ctx.commands).toHaveLength(2);
    });

    test("command executed on two buttons with two ElementRef", () => {
        const eltRef1: EltRef<EventTarget> = {
            "nativeElement": button1
        };
        const eltRef2: EltRef<EventTarget> = {
            "nativeElement": button2
        };

        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on(eltRef1, eltRef2)
            .bind();

        button2.click();
        button1.click();

        expect(ctx.commands).toHaveLength(2);
    });

    test("command executed on two buttons with one array of ElementRef", () => {
        const eltRef1: EltRef<EventTarget> = {
            "nativeElement": button1
        };
        const eltRef2: EltRef<EventTarget> = {
            "nativeElement": button2
        };

        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on([eltRef1, eltRef2])
            .bind();

        button2.click();
        button1.click();

        expect(ctx.commands).toHaveLength(2);
    });

    test("command executed on 2 buttons using several on", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on(button1)
            .on(button2)
            .bind();

        button2.click();
        button1.click();

        expect(ctx.commands).toHaveLength(2);
    });

    test("check ifhadeffects", () => {
        cmd = new StubCmd(true);
        jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
        const ifEffects = jest.fn();
        const ifNoEffects = jest.fn();
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .on(button1)
            .ifHadEffects(ifEffects)
            .ifHadNoEffect(ifNoEffects)
            .bind();

        button1.click();

        expect(ifEffects).toHaveBeenCalledTimes(1);
        expect(ifNoEffects).not.toHaveBeenCalled();
    });

    test("check ifhadnoeffects", () => {
        cmd = new StubCmd(true);
        jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
        const ifEffects = jest.fn();
        const ifNoEffects = jest.fn();
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .on(button1)
            .ifHadEffects(ifEffects)
            .ifHadNoEffect(ifNoEffects)
            .bind();

        button1.click();

        expect(ifNoEffects).toHaveBeenCalledTimes(1);
        expect(ifEffects).not.toHaveBeenCalled();
    });

    test("init1Executed", () => {
        binding = bindings.buttonBinder()
            .on(button1)
            .toProduce(() => cmd)
            .first(c => {
                c.exec = 10;
            })
            .bind();

        button1.click();

        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(11);
    });

    test("init2Executed", () => {
        binding = bindings.buttonBinder()
            .toProduce(_i => cmd)
            .first((c, _i) => {
                c.exec = 10;
            })
            .on(button1)
            .bind();

        button1.click();

        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(11);
    });

    test("checkFalse", () => {
        binding = bindings.buttonBinder()
            .toProduce(_i => cmd)
            .when(_i => false)
            .on(button1)
            .bind();

        button1.click();

        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(0);
    });

    test("commandExecutedOnTwoButtonsSame", () => {
        let cpt = 0;
        binding = bindings.buttonBinder()
            .on(button1, button1)
            .toProduce(() => cmd)
            .end(_i => {
                cpt++;
            })
            .bind();

        button1.click();

        expect(binding).toBeDefined();
        expect(cmd.exec).toBe(1);
        expect(cpt).toBe(1);
    });

    test("builderCloned", () => {
        const binder = bindings.buttonBinder();

        expect(binder).not.toBe(bindings.buttonBinder());
        expect(binder).not.toBe(bindings.buttonBinder().toProduce(() => cmd));
        expect(binder).not.toBe(bindings.buttonBinder().toProduce(() => cmd)
            .first(() => {}));
        expect(binder).not.toBe(bindings.buttonBinder().on(button1));
        expect(binder).not.toBe(bindings.buttonBinder().when(() => false));
        expect(binder).not.toBe(bindings.buttonBinder().toProduce(_i => cmd)
            .end(_c => {}));
        expect(binder).not.toBe(bindings.buttonBinder().log("command"));
    });

    test("clonedBuildersSameWidgetCmdOK", () => {
        let cpt1 = 0;
        let cpt2 = 0;
        const binder = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .on(button1);
        binding = binder
            .end(_i => {
                cpt1++;
            })
            .bind();
        const binding2 = binder
            .end(_i => {
                cpt2++;
            })
            .bind();

        button1.click();

        expect(binding).not.toBe(binding2);
        expect(cpt1).toBe(1);
        expect(cpt2).toBe(1);
    });

    test("clonedBuildersDiffWidgetsCmdOK", () => {
        let cpt1 = 0;
        let cpt2 = 0;
        const binder = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true));
        binding = binder
            .on(button1)
            .end(_i => {
                cpt1++;
            })
            .bind();
        const binding2 = binder
            .on(button2)
            .end(_i => {
                cpt2++;
            })
            .bind();

        button1.click();
        button2.click();

        expect(binding).not.toBe(binding2);
        expect(cpt1).toBe(1);
        expect(cpt2).toBe(1);
    });

    test("prevent default set", () => {
        binding = bindings.buttonBinder()
            .preventDefault()
            .toProduce(() => cmd)
            .on(button1)
            .bind();

        expect(binding.interaction.preventDefault).toBeTruthy();
        expect(binding.interaction.stopImmediatePropagation).toBeFalsy();
        expect(binding).toBeDefined();
    });

    test("stop propag set", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .stopImmediatePropagation()
            .on(button1)
            .bind();

        expect(binding.interaction.stopImmediatePropagation).toBeTruthy();
        expect(binding.interaction.preventDefault).toBeFalsy();
        expect(binding).toBeDefined();
    });

    test("set name", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .name("foo")
            .on(button1)
            .name("yoo")
            .bind();

        expect(binding).toBeDefined();
        expect(binding.name).toBe("yoo");
    });

    test("set no name", () => {
        binding = bindings.buttonBinder()
            .toProduce(() => cmd)
            .on(button1)
            .bind();

        expect(binding).toBeDefined();
        expect(binding.name).toBe("ButtonPressed");
    });

    test("on dynamic eltRef", async () => {
        const div = document.createElement("div");
        const eltRef: EltRef<HTMLDivElement> = {
            "nativeElement": div
        };
        binding = bindings.buttonBinder()
            .toProduce(() => new StubCmd(true))
            .onDynamic(eltRef)
            .bind();

        div.append(button1);
        await Promise.resolve();
        button1.click();
        button2.click();

        expect(binding).toBeDefined();
        expect(ctx.commands).toHaveLength(1);
    });

    describe("on dynamic", () => {
        let div: HTMLDivElement;
        let button3: HTMLButtonElement;

        beforeEach(() => {
            div = document.createElement("div");
            button3 = document.createElement("button");
        });

        test("on dynamic one button", async () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubCmd(true))
                .onDynamic(div)
                .bind();

            div.append(button1);
            await Promise.resolve();

            button1.click();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(1);
        });

        test("on dynamic two buttons", async () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubCmd(true))
                .onDynamic(div)
                .bind();

            div.append(button2);
            await Promise.resolve();
            div.append(button3);
            await Promise.resolve();

            button2.click();
            button3.click();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(2);
        });

        test("on dynamic nothing", () => {
            binding = bindings.buttonBinder()
                .toProduce(() => new StubCmd(true))
                .onDynamic(div)
                .bind();

            div.click();

            expect(binding).toBeDefined();
            expect(ctx.commands).toHaveLength(0);
        });

        test("on dynamic when remove buttons", async () => {
            binding = bindings.buttonBinder()
                .onDynamic(div)
                .toProduce(() => new StubCmd(true))
                .bind();

            div.append(button2);
            await Promise.resolve();
            div.append(button3);
            await Promise.resolve();
            button2.remove();
            await Promise.resolve();

            button2.click();
            button3.click();

            expect(ctx.commands).toHaveLength(1);
        });
    });
});
