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
import { WidgetBinding, ButtonPressed, WidgetData, buttonBinder, CommandsRegistry, UndoCollector } from "../../src";
import { StubCmd } from "../command/StubCmd";
import { Subscription } from "rxjs";

let button1: HTMLElement;
// let button2: HTMLElement;
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
    // const elt2 = document.getElementById("b2");
    // if (elt2 !== null) {
    //     button2 = elt2;
    // }
    cmd = new StubCmd();
    cmd.candoValue = true;
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

 /*
import { StubFSMHandler } from "../fsm/StubFSMHandler";
import { ButtonPressed } from "../../src/interaction/library/ButtonPressed";
import { StubCmd } from "../command/StubCmd";
import { WidgetData } from "../../src/interaction/WidgetData";
import { WidgetBindingImpl } from "../../src";

jest.mock("../fsm/StubFSMHandler");
jest.mock("../command/StubCmd");


test("Button binder produces a binding", () => {
    expect(binding).not.toBeNull();
});

test("Click on button triggers the interaction", () => {
    const handler = new StubFSMHandler();
    binding.getInteraction().getFsm().addHandler(handler);
    button.click();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("Click on button produces a command", () => {
    button.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});
*/
