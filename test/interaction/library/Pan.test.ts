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

import {createTouchEvent} from "../StubEvents";
import type {FSMHandler} from "../../../src/interacto";
import {Pan, TouchDataImpl} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {checkTouchPoint} from "../../Utils";

let interaction: Pan;
let canvas: HTMLElement;
let handler: FSMHandler;
let dataSrc: TouchDataImpl;
let dataTgt: TouchDataImpl;

beforeEach(() => {
    dataSrc = new TouchDataImpl();
    dataTgt = new TouchDataImpl();
    handler = mock<FSMHandler>();
    canvas = document.createElement("canvas");
});

afterEach(() => {
    interaction.uninstall();
    jest.clearAllTimers();
});

describe("horizontal", () => {
    beforeEach(() => {
        interaction = new Pan(true, 100, 10);
        interaction.fsm.addHandler(handler);
    });

    test("not created twice", () => {
        interaction.fsm.buildFSM();
        expect(interaction.fsm.states).toHaveLength(5);
    });

    test("touch", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move OK", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts.mockImplementation(() => {
            dataSrc.copy(interaction.data.src);
            dataTgt.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 150, 200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16, 30, 160, 210));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();

        checkTouchPoint(dataSrc, 150, 200, 15, 20, 3, canvas);
        checkTouchPoint(dataTgt, 160, 210, 16, 30, 3, canvas);
    });

    [11, -11].forEach((y: number) => {
        test("touch move KO not horizontal enough", () => {
            interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15,
                20, 150, 200));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16,
                20 + y, 160, 200 + y));
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });
    });

    test("touch release", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move KO not same ID", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        interaction.processEvent(createTouchEvent("touchmove", 1, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });


    [11, -11].forEach((y: number) => {
        test("touch move move cancelled not horizontal enough", () => {
            interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15,
                20, 150, 200));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16,
                20, 160, 200));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16,
                20 + y, 160, 200 + y));
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });

    test("touch move move OK", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates.mockImplementation(() => {
            dataSrc.copy(interaction.data.src);
            dataTgt.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 150, 200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16, 30, 160, 201));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 17, 30, 170, 210));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();

        checkTouchPoint(dataSrc, 150, 200, 15, 20, 3, canvas);
        checkTouchPoint(dataTgt, 170, 210, 17, 30, 3, canvas);
    });

    test("touch move move not horiz", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 150, 200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16, 30, 160, 201));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 17, 41, 170, 212));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("touch move move release before distance min", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 150, 200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16, 30, 160, 201));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 17, 30, 170, 210));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 114, 30, 249, 210));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });


    test("touch move move release OK", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops.mockImplementation(() => {
            dataSrc.copy(interaction.data.src);
            dataTgt.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 150, 200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16, 30, 160, 201));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 115, 30, 250, 210));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas, 115, 30, 250, 210));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();

        checkTouchPoint(dataSrc, 150, 200, 15, 20, 3, canvas);
        checkTouchPoint(dataTgt, 250, 210, 115, 30, 3, canvas);
    });
});


