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

import type {FSMHandler} from "../../../src/interacto";
import {ButtonPressed} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "../StubEvents";

let interaction: ButtonPressed;
let button: HTMLButtonElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new ButtonPressed();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    button = document.createElement("button");
});

test("click event start and stop the interaction ButtonPressed", () => {
    interaction.registerToNodes([button]);
    button.click();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});


test("other event don't trigger the interaction ButtonPressed", () => {
    interaction.registerToNodes([button]);
    robot().change(button);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM({
        initToPressedHandler(): void {
        },
        reinitData(): void {
        }
    });
    expect(interaction.fsm.states).toHaveLength(count);
});

test("cannot register non button", () => {
    const w = document.createElement("a");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non button", () => {
    const w = document.createElement("a");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});
