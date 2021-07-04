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
import {Scroll} from "../../../src/interacto";
import {robot} from "../StubEvents";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";

let interaction: Scroll;
let canvas: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new Scroll();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    canvas = document.createElement("canvas");
});

test("scroll event start and stop the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas).scroll();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("scroll data", () => {
    let target: EventTarget | null = null;
    interaction.registerToNodes([canvas]);
    handler.fsmStops.mockImplementation(() => {
        target = interaction.data.target;
    });
    robot(canvas).scroll();
    expect(target).toBe(canvas);
});

test("scroll event start and stop the interaction with widget", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas).scroll();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("multiple scroll trigger multiple interaction that start and stop", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .scroll()
        .scroll()
        .scroll();
    expect(handler.fsmStops).toHaveBeenCalledTimes(3);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(3);
});
