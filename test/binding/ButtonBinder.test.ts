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
import {Subscription} from "rxjs";
import {
    buttonBinder,
    ButtonPressed,
    CommandsRegistry,
    isButton,
    LogLevel,
    UndoCollector,
    WidgetBinding,
    WidgetData
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";

let button1: HTMLButtonElement;
let button2: HTMLButtonElement;
let binding: WidgetBinding<StubCmd, ButtonPressed, WidgetData<HTMLButtonElement>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    document.documentElement.innerHTML = "<html><div><button id='b1'>A Button</button><button id='b2'>A Button2</button></div></html>";
    const elt1 = document.getElementById("b1");
    if (elt1 !== null && isButton(elt1)) {
        button1 = elt1;
    }
    const elt2 = document.getElementById("b2");
    if (elt2 !== null && isButton(elt2)) {
        button2 = elt2;
    }
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if(binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("testCommandExecutedOnSingleButtonConsumer", () => {
    binding = buttonBinder()
        .toProduce(() => cmd)
        .on(button1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    button1.click();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
});

test("testCommandExecutedOnSingleButtonConsumerConsumer", () => {
    binding = buttonBinder()
        .on(button1)
        .toProduce(_i => cmd)
        .bind();

    button1.click();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoButtons", () => {
    binding = buttonBinder()
        .toProduce(() => new StubCmd(true))
        .on(button1, button2)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    button2.click();
    button1.click();

    expect(binding).not.toBeNull();
    expect(producedCmds).toHaveLength(2);
    expect(producedCmds[0]).not.toBe(producedCmds[1]);
    expect(producedCmds[0].exec).toStrictEqual(1);
    expect(producedCmds[1].exec).toStrictEqual(1);
});

test("testInit1Executed", () => {
    binding = buttonBinder()
        .on(button1)
        .toProduce(() => cmd)
        .first(c => c.exec = 10)
        .bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(11);
});

test("testInit2Executed", () => {
    binding = buttonBinder()
        .toProduce(_i => cmd)
        .first((c, _i) => c.exec = 10)
        .on(button1)
        .bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = buttonBinder()
        .toProduce(_i => cmd)
        .when(_i => false)
        .on(button1)
        .bind();

    button1.click();

    expect(binding).not.toBeNull();
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

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
    expect(cpt).toStrictEqual(1);
});

test("testBuilderCloned", () => {
    const binder = buttonBinder();

    expect(binder).not.toBe(buttonBinder);
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd));
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd).first(() => { }));
    expect(binder).not.toBe(buttonBinder().on(button1));
    expect(binder).not.toBe(buttonBinder().when(() => false));
    expect(binder).not.toBe(buttonBinder().toProduce(_i => cmd).end(_c => { }));
    expect(binder).not.toBe(buttonBinder().log(LogLevel.COMMAND));
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
    expect(binding).not.toBeUndefined();
});

test("stop propag set", () => {
    binding = buttonBinder()
        .toProduce(() => cmd)
        .stopImmediatePropagation()
        .on(button1)
        .bind();

    expect(binding.getInteraction().stopImmediatePropagation).toBeTruthy();
    expect(binding.getInteraction().preventDefault).toBeFalsy();
    expect(binding).not.toBeUndefined();
});
