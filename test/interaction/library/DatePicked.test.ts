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
import {DatePicked} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: DatePicked;
let date: HTMLInputElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DatePicked();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    date = document.createElement("input");
    date.type = "date";
});

test("input event starts and stops the interaction DatePicked.", () => {
    interaction.registerToNodes([date]);
    robot().input(date);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction.", () => {
    interaction.registerToNodes([date]);
    robot().change(date);
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM({
        initToPickedHandler(): void {
        },
        reinitData(): void {
        }
    });
    expect(interaction.fsm.states).toHaveLength(count);
});

test("cannot register non date picker", () => {
    const w = document.createElement("div");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non date picker", () => {
    const w = document.createElement("div");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});

