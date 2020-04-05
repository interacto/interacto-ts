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

//
// test("pressure release", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 23, 12, 25));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
//     expect(handler.fsmStops).not.toHaveBeenCalled();
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move data", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
//
//     interaction.getFsm().addHandler(new class extends StubFSMHandler {
//         public constructor() {
//             super();
//         }
//
//         public fsmUpdates(): void {
//             expect(interaction.getData().getSrcClientX()).toBe(11);
//             expect(interaction.getData().getSrcClientY()).toBe(23);
//             expect(interaction.getData().getSrcScreenX()).toBe(12);
//             expect(interaction.getData().getSrcScreenY()).toBe(25);
//             expect(interaction.getData().getTgtClientX()).toBe(141);
//             expect(interaction.getData().getTgtClientY()).toBe(25);
//             expect(interaction.getData().getTgtScreenX()).toBe(14);
//             expect(interaction.getData().getTgtScreenY()).toBe(28);
//             expect(interaction.getData().getTouchId()).toBe(2);
//             expect(interaction.getData().getButton()).toBeUndefined();
//             const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
//             expect(tgtElem).toBe(canvas);
//         }
//     }());
//
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 141, 24, 14, 28));
// });
//
// test("pressure move move KO", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 1, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
//     expect(handler.fsmStops).not.toHaveBeenCalled();
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move move OK", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
//     expect(handler.fsmStops).not.toHaveBeenCalled();
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move move OK data", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 4, canvas, 111, 213, 112, 215));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 4, canvas, 11, 24, 14, 28));
//
//     interaction.getFsm().addHandler(new class extends StubFSMHandler {
//         public constructor() {
//             super();
//         }
//
//         public fsmUpdates(): void {
//             expect(interaction.getData().getSrcClientX()).toBe(111);
//             expect(interaction.getData().getSrcClientY()).toBe(213);
//             expect(interaction.getData().getSrcScreenX()).toBe(112);
//             expect(interaction.getData().getSrcScreenY()).toBe(215);
//             expect(interaction.getData().getTgtClientX()).toBe(110);
//             expect(interaction.getData().getTgtClientY()).toBe(240);
//             expect(interaction.getData().getTgtScreenX()).toBe(140);
//             expect(interaction.getData().getTgtScreenY()).toBe(280);
//             expect(interaction.getData().getTouchId()).toBe(4);
//             expect(interaction.getData().getButton()).toBeUndefined();
//             const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
//             expect(tgtElem).toBe(canvas);
//         }
//     }());
//
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 4, canvas, 110, 240, 140, 280));
// });
//
// test("pressure move release", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
//     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move release data", () => {
//     interaction.getFsm().addHandler(new class extends StubFSMHandler {
//         public constructor() {
//             super();
//         }
//
//         public fsmUpdates(): void {
//             expect(interaction.getData().getSrcClientX()).toBe(111);
//             expect(interaction.getData().getSrcClientY()).toBe(231);
//             expect(interaction.getData().getSrcScreenX()).toBe(121);
//             expect(interaction.getData().getSrcScreenY()).toBe(251);
//             expect(interaction.getData().getTgtClientX()).toBe(110);
//             expect(interaction.getData().getTgtClientY()).toBe(240);
//             expect(interaction.getData().getTgtScreenX()).toBe(140);
//             expect(interaction.getData().getTgtScreenY()).toBe(280);
//             expect(interaction.getData().getTouchId()).toBe(0);
//             expect(interaction.getData().getButton()).toBeUndefined();
//             const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
//             expect(tgtElem).toBe(canvas);
//         }
//     }());
//
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 0, canvas, 111, 231, 121, 251));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 0, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 0, canvas, 110, 240, 140, 280));
// });
//
// test("pressure move release KO", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
//     expect(handler.fsmStops).not.toHaveBeenCalled();
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move move release", () => {
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
//     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("pressure move move release data", () => {
//     interaction.getFsm().addHandler(new class extends StubFSMHandler {
//         public constructor() {
//             super();
//         }
//
//         public fsmUpdates(): void {
//             expect(interaction.getData().getSrcClientX()).toBe(11);
//             expect(interaction.getData().getSrcClientY()).toBe(23);
//             expect(interaction.getData().getSrcScreenX()).toBe(12);
//             expect(interaction.getData().getSrcScreenY()).toBe(25);
//             expect(interaction.getData().getTgtClientX()).toBe(171);
//             expect(interaction.getData().getTgtClientY()).toBe(274);
//             expect(interaction.getData().getTgtScreenX()).toBe(174);
//             expect(interaction.getData().getTgtScreenY()).toBe(278);
//             expect(interaction.getData().getTouchId()).toBe(0);
//             expect(interaction.getData().getButton()).toBeUndefined();
//             const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
//             expect(tgtElem).toBe(canvas);
//         }
//
//         public fsmStops(): void {
//             expect(interaction.getData().getSrcClientX()).toBe(11);
//             expect(interaction.getData().getSrcClientY()).toBe(23);
//             expect(interaction.getData().getSrcScreenX()).toBe(12);
//             expect(interaction.getData().getSrcScreenY()).toBe(25);
//             expect(interaction.getData().getTgtClientX()).toBe(171);
//             expect(interaction.getData().getTgtClientY()).toBe(274);
//             expect(interaction.getData().getTgtScreenX()).toBe(174);
//             expect(interaction.getData().getTgtScreenY()).toBe(278);
//             expect(interaction.getData().getTouchId()).toBe(0);
//             expect(interaction.getData().getButton()).toBeUndefined();
//             const tgtElem: HTMLCanvasElement = interaction.getData().getTgtObject() as HTMLCanvasElement;
//             expect(tgtElem).toBe(canvas);
//         }
//     }());
//
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
// });
//
// test("touch on registered widget", () => {
//     interaction.registerToNodes([canvas]);
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
//     expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
//     expect(handler.fsmStops).toHaveBeenCalledTimes(1);
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("touch on unregistered widget", () => {
//     interaction.registerToNodes([canvas]);
//     interaction.unregisterFromNodes([canvas]);
//     canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).not.toHaveBeenCalled();
//     expect(handler.fsmUpdates).not.toHaveBeenCalled();
//     expect(handler.fsmCancels).not.toHaveBeenCalled();
// });
//
// test("touch restart", () => {
//     interaction.registerToNodes([canvas]);
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     interaction.processEvent(createTouchEvent(EventRegistrationToken.Touchend, 3, canvas, 171, 274, 174, 278));
//     canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, canvas, 11, 23, 12, 25));
//     canvas.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, canvas, 11, 24, 14, 28));
//     expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
// });
//
// test("no modifiers and button", () => {
//     expect(interaction.getData().isAltPressed()).toBeFalsy();
//     expect(interaction.getData().isCtrlPressed()).toBeFalsy();
//     expect(interaction.getData().isMetaPressed()).toBeFalsy();
//     expect(interaction.getData().isShiftPressed()).toBeFalsy();
//     expect(interaction.getData().getButton()).toBeUndefined();
// });
