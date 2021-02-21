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

import {FSMHandler, Swipe} from "../../../src/interacto";
import {createTouchEvent, robot} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {checkTouchPoint} from "../../Utils";
import {TouchDataImpl} from "../../../src/impl/interaction/library/TouchDataImpl";

let interaction: Swipe;
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
    jest.clearAllMocks();
});

describe("horizontal", () => {
    beforeEach(() => {
        interaction = new Swipe(true, 400, 200, 10);
        interaction.getFsm().addHandler(handler);
    });

    test("not created twice", () => {
        interaction.getFsm().buildFSM();
        expect(interaction.getFsm().getStates()).toHaveLength(5);
    });

    test("touch", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move: too slow too short", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts.mockImplementation(() => {
            dataSrc.copy(interaction.getData().src);
            dataTgt.copy(interaction.getData().tgt);
        });
        interaction.getFsm().addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            15, 20, 150, 200, 100));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            16, 30, 160, 210, 2000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        checkTouchPoint(dataSrc, 150, 200, 15, 20, 3, canvas);
        checkTouchPoint(dataTgt, 160, 210, 16, 30, 3, canvas);
    });

    [20, -30].forEach((y: number) => {
        test("touch move KO not horizontal enough", () => {
            interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15,
                20, 150, 200, 10));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 16,
                20 + y, 160, 200 + y, 10));
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmUpdates).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });
    });

    test("touch release", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        interaction.processEvent(createTouchEvent("touchend", 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move KO not same ID", () => {
        interaction.processEvent(createTouchEvent("touchstart", 2, canvas));
        interaction.processEvent(createTouchEvent("touchmove", 1, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    [40, -50].forEach((y: number) => {
        test("touch move move cancelled not horizontal enough", () => {
            interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 150,
                20, 150, 200, 0));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 160,
                20, 200, 200, 10));
            interaction.processEvent(createTouchEvent("touchmove", 3, canvas, 350,
                20 + y, 250, 200 + y, 20));
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });

    test("touch move move too short too slow", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates.mockImplementation(() => {
            dataSrc.copy(interaction.getData().src);
            dataTgt.copy(interaction.getData().tgt);
        });
        interaction.getFsm().addHandler(newHandler);

        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            100, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            200, 30, 160, 201, 5200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            299, 30, 349, 210, 5399));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        checkTouchPoint(dataSrc, 150, 200, 100, 20, 3, canvas);
        checkTouchPoint(dataTgt, 349, 210, 299, 30, 3, canvas);
    });

    test("touch move move too short velocity OK", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            150, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            160, 30, 160, 201, 5050));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            200, 30, 200, 210, 5100));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move distance OK short too slow", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            150, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            160, 30, 160, 201, 6000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            350, 30, 350, 210, 7000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move release distance velocity OK 1s", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            50, 20, 100, 200, 5000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            160, 30, 160, 201, 5500));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            450, 30, 500, 210, 6000));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas,
            450, 30, 500, 210, 6000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move release distance velocity OK 1s with widget", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .touchstart({},
                [{"screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200, "identifier": 3, "target": canvas}], 5000)
            .touchmove({},
                [{"screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201, "identifier": 3, "target": canvas}], 5500)
            .touchmove({},
                [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210, "identifier": 3, "target": canvas}], 6000)
            .touchend({},
                [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210, "identifier": 3, "target": canvas}], 6000);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move release distance velocity OK 200px", () => {
        interaction.processEvent(createTouchEvent("touchstart", 3, canvas,
            50, 20, 100, 200, 5000));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            160, 30, 160, 201, 5200));
        interaction.processEvent(createTouchEvent("touchmove", 3, canvas,
            250, 30, 300, 210, 5500));
        interaction.processEvent(createTouchEvent("touchend", 3, canvas,
            250, 30, 300, 210, 5500));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });
});


