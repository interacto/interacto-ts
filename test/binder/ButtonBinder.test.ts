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

import type {Binding,
    EltRef,
    Interaction,
    InteractionData} from "../../src/interacto";
import {
    buttonBinder,
    clearBindingObserver,
    CommandsRegistry,
    LogLevel,
    setBindingObserver,
    UndoHistory
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";

let button1: HTMLButtonElement;
let button2: HTMLButtonElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;

beforeEach(() => {
    ctx = new BindingsContext();
    setBindingObserver(ctx);
    button1 = document.createElement("button");
    button2 = document.createElement("button");
    cmd = new StubCmd(true);
});

afterEach(() => {
    clearBindingObserver();
    CommandsRegistry.getInstance().clear();
    UndoHistory.getInstance().clear();
});

test("testCommandExecutedOnSingleButtonConsumer", () => {
    binding = buttonBinder()
        .toProduce(() => cmd)
        .on(button1)
        .bind();

    button1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
    expect(ctx.commands).toHaveLength(1);
    expect(ctx.commands[0]).toBe(cmd);
});

test("testCommandExecutedOnSingleButtonConsumerConsumer", () => {
    binding = buttonBinder()
        .on(button1)
        .toProduce(_i => cmd)
        .bind();

    button1.click();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoButtons", () => {
    binding = buttonBinder()
        .toProduce(() => new StubCmd(true))
        .on(button1, button2)
        .bind();

    button2.click();
    button1.click();

    expect(binding).toBeDefined();
    expect(ctx.commands).toHaveLength(2);
    expect(ctx.getCmd(0)).not.toBe(ctx.getCmd(1));
    expect(ctx.getCmd<StubCmd>(0).exec).toStrictEqual(1);
    expect(ctx.getCmd<StubCmd>(1).exec).toStrictEqual(1);
});

test("command executed on two buttons with one array", () => {
    binding = buttonBinder()
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

    binding = buttonBinder()
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

    binding = buttonBinder()
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

    binding = buttonBinder()
        .toProduce(() => new StubCmd(true))
        .on([eltRef1, eltRef2])
        .bind();

    button2.click();
    button1.click();

    expect(ctx.commands).toHaveLength(2);
});

test("command executed on 2 buttons using several on", () => {
    binding = buttonBinder()
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
    binding = buttonBinder()
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
    binding = buttonBinder()
        .toProduce(() => cmd)
        .on(button1)
        .ifHadEffects(ifEffects)
        .ifHadNoEffect(ifNoEffects)
        .bind();

    button1.click();

    expect(ifNoEffects).toHaveBeenCalledTimes(1);
    expect(ifEffects).not.toHaveBeenCalled();
});

test("testInit1Executed", () => {
    binding = buttonBinder()
        .on(button1)
        .toProduce(() => cmd)
        .first(c => {
            c.exec = 10;
        })
        .bind();

    button1.click();

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testInit2Executed", () => {
    binding = buttonBinder()
        .toProduce(_i => cmd)
        .first((c, _i) => {
            c.exec = 10;
        })
        .on(button1)
        .bind();

    button1.click();

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = buttonBinder()
        .toProduce(_i => cmd)
        .when(_i => false)
        .on(button1)
        .bind();

    button1.click();

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(0);
});

test("testCommandExecutedOnTwoButtonsSame", () => {
    let cpt = 0;
    binding = buttonBinder()
        .on(button1, button1)
        .toProduce(() => cmd)
        .end(_i => cpt++)
        .bind();

    button1.click();

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
    expect(cpt).toStrictEqual(1);
});

test("testBuilderCloned", () => {
    const binder = buttonBinder();

    expect(binder).not.toBe(buttonBinder);
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd));
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd)
        .first(() => { }));
    expect(binder).not.toBe(buttonBinder().on(button1));
    expect(binder).not.toBe(buttonBinder().when(() => false));
    expect(binder).not.toBe(buttonBinder().toProduce(_i => cmd)
        .end(_c => { }));
    expect(binder).not.toBe(buttonBinder().log(LogLevel.command));
});

test("testClonedBuildersSameWidgetCmdOK", () => {
    let cpt1 = 0;
    let cpt2 = 0;
    const binder = buttonBinder()
        .toProduce(() => new StubCmd(true))
        .on(button1);
    binding = binder
        .end(_i => cpt1++)
        .bind();
    const binding2 = binder
        .end(_i => cpt2++)
        .bind();

    button1.click();

    expect(binding).not.toBe(binding2);
    expect(cpt1).toStrictEqual(1);
    expect(cpt2).toStrictEqual(1);
});

test("testClonedBuildersDiffWidgetsCmdOK", () => {
    let cpt1 = 0;
    let cpt2 = 0;
    const binder = buttonBinder()
        .toProduce(() => new StubCmd(true));
    binding = binder
        .on(button1)
        .end(_i => cpt1++)
        .bind();
    const binding2 = binder
        .on(button2)
        .end(_i => cpt2++)
        .bind();

    button1.click();
    button2.click();

    expect(binding).not.toBe(binding2);
    expect(cpt1).toStrictEqual(1);
    expect(cpt2).toStrictEqual(1);
});

test("prevent default set", () => {
    binding = buttonBinder()
        .preventDefault()
        .toProduce(() => cmd)
        .on(button1)
        .bind();

    expect(binding.getInteraction().preventDefault).toBeTruthy();
    expect(binding.getInteraction().stopImmediatePropagation).toBeFalsy();
    expect(binding).toBeDefined();
});

test("stop propag set", () => {
    binding = buttonBinder()
        .toProduce(() => cmd)
        .stopImmediatePropagation()
        .on(button1)
        .bind();

    expect(binding.getInteraction().stopImmediatePropagation).toBeTruthy();
    expect(binding.getInteraction().preventDefault).toBeFalsy();
    expect(binding).toBeDefined();
});
