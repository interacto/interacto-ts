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

import {StubFSMHandler} from "../../fsm/StubFSMHandler";
import {EventRegistrationToken, FSMHandler, Swipe} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");


let interaction: Swipe;
let canvas: HTMLElement;
let handler: FSMHandler;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let data: any;

beforeEach(() => {
    handler = new StubFSMHandler();
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    canvas = document.getElementById("canvas1") as HTMLElement;
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
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move: too slow too short", () => {
        interaction.getFsm().addHandler(new class extends StubFSMHandler {
            public fsmStarts(): void {
                data = {...interaction.getData()};
            }
        }());

        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            15, 20, 150, 200, 100));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            16, 30, 160, 210, 2000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(data.srcClientX).toBe(150);
        expect(data.srcClientY).toBe(200);
        expect(data.srcScreenX).toBe(15);
        expect(data.srcScreenY).toBe(20);
        expect(data.tgtClientX).toBe(160);
        expect(data.tgtClientY).toBe(210);
        expect(data.tgtScreenX).toBe(16);
        expect(data.tgtScreenY).toBe(30);
        expect(data.touchID).toBe(3);
        expect(data.button).toBeUndefined();
        expect(data.tgtObject).toBe(canvas);
    });

    [20, -30].forEach(y => {
        test("touch move KO not horizontal enough", () => {
            interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 15,
                20, 150, 200, 10));
            interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 16,
                20 + y, 160, 200 + y, 10));
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmUpdates).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });
    });

    test("touch release", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move KO not same ID", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 1, canvas));
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmUpdates).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    [40, -50].forEach(y => {
        test("touch move move cancelled not horizontal enough", () => {
            interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 150,
                20, 150, 200, 0));
            interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 160,
                20, 200, 200, 10));
            interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 350,
                20 + y, 250, 200 + y, 20));
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });
    });

    test("touch move move too short too slow", () => {
        interaction.getFsm().addHandler(new class extends StubFSMHandler {
            public fsmUpdates(): void {
                data = {...interaction.getData()};
            }
        }());

        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            100, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            200, 30, 160, 201, 5200));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            299, 30, 349, 210, 5399));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(data.srcClientX).toBe(150);
        expect(data.srcClientY).toBe(200);
        expect(data.srcScreenX).toBe(100);
        expect(data.srcScreenY).toBe(20);
        expect(data.tgtClientX).toBe(349);
        expect(data.tgtClientY).toBe(210);
        expect(data.tgtScreenX).toBe(299);
        expect(data.tgtScreenY).toBe(30);
        expect(data.touchID).toBe(3);
        expect(data.button).toBeUndefined();
        expect(data.tgtObject).toBe(canvas);
    });

    test("touch move move too short velocity OK", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            150, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            160, 30, 160, 201, 5050));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            200, 30, 200, 210, 5100));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move distance OK short too slow", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            150, 20, 150, 200, 5000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            160, 30, 160, 201, 6000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            350, 30, 350, 210, 7000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move release distance velocity OK 1s", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            50, 20, 100, 200, 5000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            160, 30, 160, 201, 5500));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            450, 30, 500, 210, 6000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas,
            450, 30, 500, 210, 6000));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch move move release distance velocity OK 200px", () => {
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas,
            50, 20, 100, 200, 5000));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            160, 30, 160, 201, 5200));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas,
            250, 30, 300, 210, 5500));
        interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas,
            250, 30, 300, 210, 5500));

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    // test("move", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("touch move", () => {
    //     const evt1 = createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (evt1 as any).timestamp = 0;
    //     interaction.processEvent(evt1);
    //     const evt2 = createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (evt2 as any).timestamp = 10;
    //     interaction.processEvent(evt2);
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move release", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    // });
    //
    // test("move move KO: not enough pixels", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 100, 30,
    //         200, 210, 100));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 499, 30,
    //         599, 210, 1100));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move OK", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 200, 30,
    //         200, 210, 200));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 600, 30,
    //         600, 210, 1200));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move KO: ok pixel but too slow", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 200, 30,
    //         200, 210, 200));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 600, 30,
    //         600, 210, 1201));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move move KO: ok pixel but too slow", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 200, 30,
    //         200, 210, 200));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 600, 30,
    //         600, 210, 1201));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 1000, 30,
    //         1000, 210, 2202));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move move KO: not enough pixels", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 100, 30,
    //         200, 210, 100));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 499, 30,
    //         599, 210, 1100));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 898, 30,
    //         998, 210, 2100));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    //     expect(handler.fsmStops).not.toHaveBeenCalled();
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move move OK: one time", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 200, 30,
    //         200, 210, 200));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 400, 30,
    //         400, 210, 1000));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 600, 30,
    //         600, 210, 1200));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
    //
    // test("move move move OK: two time", () => {
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 200, 30,
    //         200, 210, 200));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 600, 30,
    //         600, 210, 1100));
    //     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 1000, 30,
    //         1000, 210, 2000));
    //     expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    //     expect(handler.fsmCancels).not.toHaveBeenCalled();
    // });
});


