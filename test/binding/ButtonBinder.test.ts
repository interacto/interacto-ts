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
import { WidgetBinding, ButtonPressed, WidgetData, buttonBinder, CommandsRegistry, UndoCollector, LogLevel } from "../../src";
import { StubCmd } from "../command/StubCmd";
import { Subscription } from "rxjs";

let button1: HTMLElement;
let button2: HTMLElement;
let binding: WidgetBinding<StubCmd, ButtonPressed, WidgetData<Element>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    document.documentElement.innerHTML = "<html><div><button id='b1'>A Button</button><button id='b2'>A Button2</button></div></html>";
    const elt1 = document.getElementById("b1");
    if (elt1 !== null) {
        button1 = elt1;
    }
    const elt2 = document.getElementById("b2");
    if (elt2 !== null) {
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
});

test("testCommandExecutedOnSingleButtonConsumer", () => {
    binding = buttonBinder()
        .toProduce(() => cmd)
        .on(button1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    button1.click();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(1);
    expect(producedCmds.length).toEqual(1);
    expect(producedCmds[0]).toBe(cmd);
});

test("testCommandExecutedOnSingleButtonConsumer", () => {
    binding = buttonBinder()
        .on(button1)
        .toProduce(i => cmd)
        .bind();

    button1.click();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(1);
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
    expect(producedCmds.length).toEqual(2);
    expect(producedCmds[0]).not.toBe(producedCmds[1]);
    expect(producedCmds[0].exec).toEqual(1);
    expect(producedCmds[1].exec).toEqual(1);
});

test("testInit1Executed", () => {
    binding = buttonBinder()
			.on(button1)
			.toProduce(() => cmd)
			.first(c => c.exec = 10)
			.bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(11);
});

test("testInit2Executed", () => {
    binding = buttonBinder()
			.toProduce(i => cmd)
			.first((c, i) => c.exec = 10)
			.on(button1)
			.bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(11);
});

test("testCheckFalse", () => {
    binding = buttonBinder()
			.toProduce(i => cmd)
			.when(i => false)
			.on(button1)
			.bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(0);
});

test("testCommandExecutedOnTwoButtonsSame", () => {
    let cpt = 0;
    binding = buttonBinder()
			.on(button1, button1)
			.toProduce(() => cmd)
			.end(i => cpt++)
			.bind();

    button1.click();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(1);
    expect(cpt).toEqual(1);
});

test("testBuilderCloned", () => {
    const binder = buttonBinder();

    expect(binder).not.toBe(buttonBinder);
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd));
    expect(binder).not.toBe(buttonBinder().toProduce(() => cmd).first(() => { }));
    expect(binder).not.toBe(buttonBinder().on(button1));
    expect(binder).not.toBe(buttonBinder().when(() => false));
    expect(binder).not.toBe(buttonBinder().toProduce(i => cmd).end(c => { }));
    expect(binder).not.toBe(buttonBinder().log(LogLevel.COMMAND));
});

test("testClonedBuildersSameWidgetCmdOK", () => {
    let cpt1 = 0;
    let cpt2 = 0;
    const binder = buttonBinder()
        .toProduce(() => new StubCmd(true))
        .on(button1);
    const binding1 = binder
            .end(i => cpt1++)
            .bind();
    const binding2 = binder
            .end(i => cpt2++)
            .bind();

    button1.click();

    expect(binding1).not.toBe(binding2);
    expect(cpt1).toEqual(1);
    expect(cpt2).toEqual(1);
});

test("testClonedBuildersDiffWidgetsCmdOK", () => {
    let cpt1 = 0;
    let cpt2 = 0;
    const binder = buttonBinder()
        .toProduce(() => new StubCmd(true));
    const binding1 = binder
            .on(button1)
            .end(i => cpt1++)
            .bind();
    const binding2 = binder
            .on(button2)
            .end(i => cpt2++)
            .bind();

    button1.click();
    button2.click();

    expect(binding1).not.toBe(binding2);
    expect(cpt1).toEqual(1);
    expect(cpt2).toEqual(1);
});
