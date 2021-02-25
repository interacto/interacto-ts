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
import {LongTouch, TouchDataImpl} from "../../../src/interacto";
import {createTouchEvent} from "../StubEvents";
import {mock} from "jest-mock-extended";
import {checkTouchPoint} from "../../Utils";

let interaction: LongTouch;
let canvas: HTMLElement;
let handler: FSMHandler;


test("cannot create 0 or less duration", () => {
    expect(() => new LongTouch(0)).toThrow("Incorrect duration");
});

describe("long touch test", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        handler = mock<FSMHandler>();
        canvas = document.createElement("canvas");
    });

    afterEach(() => {
        interaction.uninstall();
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    test("cannot build the interaction twice", () => {
        interaction = new LongTouch(100);
        interaction.getFsm().buildFSM();
        expect(interaction.getFsm().getStates()).toHaveLength(4);
    });

    [1000, 2000].forEach(duration => {
        describe(`long touch ${String(duration)}`, () => {
            beforeEach(() => {
                interaction = new LongTouch(duration);
                interaction.getFsm().addHandler(handler);
            });

            test("touch does not end", () => {
                const touchData = new TouchDataImpl();
                const newHandler = mock<FSMHandler>();
                newHandler.fsmStarts.mockImplementation(() => {
                    touchData.copy(interaction.getData());
                });
                interaction.getFsm().addHandler(newHandler);
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas, 15, 20, 160, 21));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).not.toHaveBeenCalled();
                checkTouchPoint(touchData, 160, 21, 15, 20, 3, canvas);
            });

            test("touch with early release", () => {
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                interaction.processEvent(createTouchEvent("touchend", 3, canvas));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("touch with timeout", () => {
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).not.toHaveBeenCalled();
            });


            test("two taps then timeout", () => {
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                interaction.processEvent(createTouchEvent("touchend", 3, canvas));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });
        });
    });
});

