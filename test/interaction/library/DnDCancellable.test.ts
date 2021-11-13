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
import {DnD} from "../../../src/interacto";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";

let interaction: DnD;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DnD(true);
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    canvas = document.createElement("canvas");
});

test("press execution", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas).mousedown();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("press escape key while press don't trigger the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .mousedown({"clientX": 11, "clientY": 23})
        .keydown({"code": "Escape"});
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("press escape after moving cancel the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .mousedown()
        .mousemove()
        .keydown({"code": "Escape"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("press escape after multiple move cancel the interaction.", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .mousedown()
        .mousemove()
        .mousemove()
        .keydown({"code": "Escape"});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("interaction restart after cancel", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .mousedown()
        .mousemove()
        .keydown({"code": "Escape"})
        .mousedown()
        .mousemove();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
});

test("check if release on dwells-spring object, cancelled", () => {
    const div = document.createElement("div");
    canvas.append(div);
    div.classList.add("ioDwellSpring");
    interaction.registerToNodes([canvas, div]);
    robot(canvas)
        .mousedown({"button": 0})
        .mousemove({"button": 0})
        .mouseup({
            "button": 0,
            "target": div
        });
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
});

