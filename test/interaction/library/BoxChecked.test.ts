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
import {BoxChecked} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: BoxChecked;
let boxCheck: HTMLInputElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new BoxChecked();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    boxCheck = document.createElement("input");
    boxCheck.type = "checkbox";
});

test("input event trigger the interaction CheckBox", () => {
    interaction.registerToNodes([boxCheck]);
    robot().input(boxCheck);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction CheckBox", () => {
    interaction.registerToNodes([boxCheck]);
    robot().change(boxCheck);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("cannot register non checkbox", () => {
    const w = document.createElement("div");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non checkbox", () => {
    const w = document.createElement("div");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});

test("check box contains an img on which user clicks", () => {
    const img = document.createElement("img");
    boxCheck.append(img);
    interaction.registerToNodes([boxCheck]);

    robot(img).input();

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
