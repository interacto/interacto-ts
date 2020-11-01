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

import {EventRegistrationToken, FSMDataHandler, FSMHandler, LongPress} from "../../../src/interacto";
import {createMouseEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: LongPress;
let canvas: HTMLElement;
let handler: FSMHandler;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pressData: any;


test("cannot create 0 or less duration", () => {
    expect(() => new LongPress(0)).toThrow("Incorrect duration");
});

describe("long press test", () => {
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

    test("cannot build the interaction twice", () => {
        interaction = new LongPress(200);
        interaction.getFsm().buildFSM();
        expect(interaction.getFsm().getStates()).toHaveLength(4);
    });

    test("that has data handler", () => {
        interaction = new LongPress(1);
        expect(interaction.getFsm().getDataHandler()).not.toBeUndefined();
    });

    test("that reinit cleans data", () => {
        interaction = new LongPress(100);
        jest.spyOn(interaction.getFsm().getDataHandler() as FSMDataHandler, "reinitData");
        interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 2));
        interaction.reinit();
        expect(interaction.getData().getButton()).toBeUndefined();
        expect(interaction.getData().getCurrentTarget()).toBeUndefined();
        expect(interaction.getFsm().getDataHandler()?.reinitData).toHaveBeenCalledWith();
    });

    [1000, 2000].forEach(duration => {
        describe(`long press ${String(duration)}`, () => {
            beforeEach(() => {
                interaction = new LongPress(duration);
                interaction.getFsm().addHandler(handler);
            });

            test("touch does not end", () => {
                const newHandler = mock<FSMHandler>();
                newHandler.fsmStarts.mockImplementation(() => {
                    pressData = {...interaction.getData()};
                });
                interaction.getFsm().addHandler(newHandler);
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 2));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).not.toHaveBeenCalled();
                expect(pressData.srcClientX).toBe(160);
                expect(pressData.srcClientY).toBe(21);
                expect(pressData.srcScreenX).toBe(15);
                expect(pressData.srcScreenY).toBe(20);
                expect(pressData.button).toBe(2);
            });

            test("press with early release", () => {
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseUp, canvas, 15, 20, 160, 21, 2));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("press, release with other button with timeout", () => {
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseUp, canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).not.toHaveBeenCalled();
            });


            test("two presses with timeout", () => {
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseUp, canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });
        });
    });
});

