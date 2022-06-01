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

import type {FSMHandler, Logger} from "../../../src/interacto";
import {DoubleClick, PointDataImpl} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {robot} from "../StubEvents";

let interaction: DoubleClick;
let canvas: HTMLElement;
let handler: FSMHandler;
let logger: Logger & MockProxy<Logger>;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    logger = mock<Logger>();
    interaction = new DoubleClick(logger);
    interaction.fsm.addHandler(handler);
    canvas = document.createElement("canvas");
});


test("double click on a canvas starts and stops the interaction", () => {
    interaction.registerToNodes([canvas]);
    robot().click(canvas, 2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("log interaction is ok", () => {
    interaction.log(true);
    interaction.registerToNodes([canvas]);
    robot().click(canvas, 2);

    expect(logger.logInteractionMsg).toHaveBeenCalledTimes(10);
});

test("no log interaction is ok", () => {
    interaction.registerToNodes([canvas]);
    robot().click(canvas, 2);

    expect(logger.logInteractionMsg).not.toHaveBeenCalled();
});

test("check data of the interaction.", () => {
    const data = new PointDataImpl();

    interaction.registerToNodes([canvas]);
    const newHandler = mock<FSMHandler>();
    newHandler.fsmStops = jest.fn(() => {
        data.copy(interaction.data);
    });
    interaction.fsm.addHandler(newHandler);
    robot(canvas).click({"clientX": 11, "clientY": 23}, 2);
    expect(data.clientX).toBe(11);
    expect(data.clientY).toBe(23);
    expect(data.button).toBe(0);
    expect(data.currentTarget).toBe(canvas);
});

test("that two double clicks ok", () => {
    interaction.registerToNodes([canvas]);
    robot()
        .click(canvas, 2)
        .runAllTimers()
        .click(canvas, 2);
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
        .runOnlyPendingTimers()
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
        .click(canvas, 2);
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
        .auxclick({"button": 2}, 2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});

test("dble Click OK After Delay", () => {
    interaction.registerToNodes([canvas]);
    robot(canvas)
        .auxclick({"button": 2})
        .runOnlyPendingTimers()
        .click({"button": 1}, 2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
});
