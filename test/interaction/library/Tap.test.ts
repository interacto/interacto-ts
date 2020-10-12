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

import {EventRegistrationToken, FSMHandler, Tap, TouchData} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: Tap;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    canvas = document.getElementById("canvas1") as HTMLElement;
});

afterEach(() => {
    interaction.uninstall();
    jest.clearAllMocks();
    jest.clearAllTimers();
});

describe("tap 1", () => {
    beforeEach(() => {
        interaction = new Tap(1);
        interaction.getFsm().addHandler(handler);
    });

    test("cannot rebuild the interaction", () => {
        interaction.getFsm().buildFSM();
        expect(interaction.getFsm().getStates()).toHaveLength(4);
    });

    test("one touch", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch data", () => {
        let touch: Array<TouchData> = [];
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts.mockImplementation(() => {
            touch = [...interaction.getData().getTapData()];
        });
        interaction.getFsm().addHandler(newHandler);
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 15, 20, 16, 21));

        expect(touch).toHaveLength(1);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
    });
});

describe("tap 2", () => {
    beforeEach(() => {
        interaction = new Tap(2);
        interaction.getFsm().addHandler(handler);
    });

    test("one touch", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch with timeout", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches data", () => {
        let touch: Array<TouchData> = [];

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops.mockImplementation(() => {
            touch = [...interaction.getData().getTapData()];
        });
        interaction.getFsm().addHandler(newHandler);
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 12, 27, 14, 28));

        expect(touch).toHaveLength(2);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
    });
});

describe("tap 3", () => {
    beforeEach(() => {
        interaction = new Tap(3);
        interaction.getFsm().addHandler(handler);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id with timeout", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("three touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches with diffent id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches data", () => {
        let touch: Array<TouchData> = [];

        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops.mockImplementation(() => {
            touch = [...interaction.getData().getTapData()];
        });
        interaction.getFsm().addHandler(newHandler);
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, canvas, 112, 217, 114, 128));

        expect(touch).toHaveLength(3);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
    });
});
