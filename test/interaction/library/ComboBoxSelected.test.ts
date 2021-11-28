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
import {ComboBoxSelected} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: ComboBoxSelected;
let comboBox: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new ComboBoxSelected();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    comboBox = document.createElement("select");
});

test("input event starts and stops the interaction ComboBoxSelected", () => {
    interaction.registerToNodes([comboBox]);
    robot().input(comboBox);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction", () => {
    interaction.registerToNodes([comboBox]);
    robot().change(comboBox);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM({
        initToSelectedHandler(): void {
        },
        reinitData(): void {
        }
    });
    expect(interaction.fsm.states).toHaveLength(count);
});

test("cannot register non combo box", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non combo box", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});

test("combo box contains an img on which user clicks", () => {
    const img = document.createElement("img");
    comboBox.append(img);
    interaction.registerToNodes([comboBox]);

    robot(img).input();

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
