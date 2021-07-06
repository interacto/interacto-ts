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
import {DoubleClick, PointDataImpl} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: DoubleClick;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new DoubleClick();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    canvas = document.createElement("canvas");
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM();
    expect(interaction.fsm.states).toHaveLength(count);
});

test("double click on a canvas starts and stops the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("check data of the interaction.", () => {
    const data = new PointDataImpl();

    interaction.registerToNodes([canvas]);
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops.mockImplementation(() => {
        data.copy(interaction.data);
    });
    interaction.fsm.addHandler(newHandler);
    robot(canvas)
        .click({"clientX": 11, "clientY": 23})
        .click({"clientX": 11, "clientY": 23});
    expect(data.clientX).toBe(11);
    expect(data.clientY).toBe(23);
    expect(data.button).toBe(0);
    expect(data.currentTarget).toBe(canvas);
});

test("that two double clicks ok", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .click()
        .do(() => jest.runAllTimers())
        .click()
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
});

test("move between clicks cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .mousemove()
        .click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("timout cancels the double click", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .do(() => jest.runOnlyPendingTimers())
        .click();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
    expect(handler.fsmStops).not.toHaveBeenCalled();
});

test("double click with two different mouse button for each click don't start the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click({"button": 0})
        .click({"button": 2});
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("check if the interaction is recycled after a cancel", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .click()
        .mousemove()
        .click()
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("check if the interaction work fine with bad move", () => {
    interaction.registerToNodes([canvas]);
    robot()
        .click(canvas)
        .mousemove({"button": 1})
        .click();
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("specific mouse button checking OK", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .auxclick({"button": 2})
        .auxclick({"button": 2});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("dble Click OK After Delay", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .auxclick({"button": 2})
        .do(() => jest.runOnlyPendingTimers())
        .click({"button": 1})
        .click({"button": 1});
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
