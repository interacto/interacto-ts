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
import {ColorPicked} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: ColorPicked;
let colorBox: HTMLInputElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new ColorPicked();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    colorBox = document.createElement("input");
    colorBox.type = "color";
});

test("input event starts and stops the interaction ColorPicked", () => {
    interaction.registerToNodes([colorBox]);
    robot().input(colorBox);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction", () => {
    interaction.registerToNodes([colorBox]);
    robot().click(colorBox);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("cannot register non color picker", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non color picker", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});

test("color picker contains an img on which user clicks", () => {
    const img = document.createElement("img");
    colorBox.append(img);
    interaction.registerToNodes([colorBox]);

    robot(img).input();

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
