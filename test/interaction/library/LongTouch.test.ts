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

import {LongTouch, TouchDataImpl} from "../../../src/interacto";
import {checkTouchPoint} from "../../Utils";
import {createTouchEvent, robot} from "../StubEvents";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a long touch interaction", () => {
    let interaction: LongTouch;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    test("cannot create 0 or less duration", () => {
        expect(() => new LongTouch(0, mock<Logger>())).toThrow("Incorrect duration");
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

        describe.each([1000, 2000])("long touch %s", duration => {
            beforeEach(() => {
                logger = mock<Logger>();
                interaction = new LongTouch(duration, logger);
                interaction.fsm.addHandler(handler);
                interaction.registerToNodes([canvas]);
            });

            test("touch does not end", () => {
                const touchData = new TouchDataImpl();
                const newHandler = mock<FSMHandler>();
                newHandler.fsmStarts = jest.fn(() => {
                    touchData.copy(interaction.data);
                });
                interaction.fsm.addHandler(newHandler);

                robot()
                    .touchstart(canvas, [{"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 160, "clientY": 21}]);

                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).not.toHaveBeenCalled();
                checkTouchPoint(touchData, 160, 21, 15, 20, 3, canvas);
                expect(touchData.allTouches).toHaveLength(1);
                expect(touchData.allTouches[0].identifier).toBe(3);
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

            test("log interaction is ok", () => {
                interaction.log(true);
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                jest.runOnlyPendingTimers();

                expect(logger.logInteractionMsg).toHaveBeenCalledTimes(7);
            });

            test("no log interaction is ok", () => {
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                jest.runOnlyPendingTimers();

                expect(logger.logInteractionMsg).not.toHaveBeenCalled();
            });

            test("two taps then timeout", () => {
                interaction.processEvent(createTouchEvent("touchstart", 3, canvas));
                interaction.processEvent(createTouchEvent("touchend", 3, canvas));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("moving cancels the touch", () => {
                interaction.processEvent(createTouchEvent("touchstart", 10, canvas));
                interaction.processEvent(createTouchEvent("touchmove", 10, canvas));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("moving, not with the same ID does not cancel the touch", () => {
                interaction.processEvent(createTouchEvent("touchstart", 10, canvas));
                interaction.processEvent(createTouchEvent("touchmove", 5, canvas));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).not.toHaveBeenCalled();
            });
        });
    });
});
