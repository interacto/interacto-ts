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
import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {createTouchEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: Tap;
let canvas: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.useFakeTimers();
    handler = new StubFSMHandler();
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
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch data", () => {
        let touch: Array<TouchData> = [];

        interaction.getFsm().addHandler(new class extends StubFSMHandler {
            public fsmStarts(): void {
                touch = [...interaction.getData().getTapData()];
            }
        }());
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15, 20, 16, 21));

        expect(touch).toHaveLength(1);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
        expect(touch[0].getTgtClientX()).toBe(16);
        expect(touch[0].getTgtClientY()).toBe(21);
        expect(touch[0].getTgtScreenX()).toBe(15);
        expect(touch[0].getTgtScreenY()).toBe(20);
        expect(touch[0].getTgtObject()).toBe(canvas);
    });
});

describe("tap 2", () => {
    beforeEach(() => {
        interaction = new Tap(2);
        interaction.getFsm().addHandler(handler);
    });

    test("one touch", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("one touch with timeout", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches data", () => {
        let touch: Array<TouchData> = [];

        interaction.getFsm().addHandler(new class extends StubFSMHandler {
            public fsmStops(): void {
                touch = [...interaction.getData().getTapData()];
            }
        }());
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 12, 27, 14, 28));

        expect(touch).toHaveLength(2);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
        expect(touch[1].getTgtClientX()).toBe(14);
        expect(touch[1].getTgtClientY()).toBe(28);
        expect(touch[1].getTgtScreenX()).toBe(12);
        expect(touch[1].getTgtScreenY()).toBe(27);
        expect(touch[1].getTgtObject()).toBe(canvas);
    });
});

describe("tap 3", () => {
    beforeEach(() => {
        interaction = new Tap(3);
        interaction.getFsm().addHandler(handler);
    });

    test("two touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("two touches with same id with timeout", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("three touches with same id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches with diffent id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("tap restarts with different id", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas));
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("three touches data", () => {
        let touch: Array<TouchData> = [];

        interaction.getFsm().addHandler(new class extends StubFSMHandler {
            public fsmStops(): void {
                touch = [...interaction.getData().getTapData()];
            }
        }());
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15, 20, 16, 21));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 12, 27, 14, 28));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 112, 217, 114, 128));

        expect(touch).toHaveLength(3);
        expect(touch[0].getSrcClientX()).toBe(16);
        expect(touch[0].getSrcClientY()).toBe(21);
        expect(touch[0].getSrcScreenX()).toBe(15);
        expect(touch[0].getSrcScreenY()).toBe(20);
        expect(touch[0].getSrcObject()).toBe(canvas);
        expect(touch[1].getTgtClientX()).toBe(14);
        expect(touch[1].getTgtClientY()).toBe(28);
        expect(touch[1].getTgtScreenX()).toBe(12);
        expect(touch[1].getTgtScreenY()).toBe(27);
        expect(touch[1].getTgtObject()).toBe(canvas);
        expect(touch[2].getTgtClientX()).toBe(114);
        expect(touch[2].getTgtClientY()).toBe(128);
        expect(touch[2].getTgtScreenX()).toBe(112);
        expect(touch[2].getTgtScreenY()).toBe(217);
        expect(touch[2].getTgtObject()).toBe(canvas);
    });
});
