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

import { LongMouseDown, PointDataImpl} from "../../../src/interacto";
import {createMouseEvent, robot} from "../StubEvents";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMDataHandler, FSMHandler, Logger,FSMImpl} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a long mouse down interaction", () => {
    let interaction: LongMouseDown;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    test("cannot create 0 or less duration", () => {
        expect(() => new LongMouseDown(0, mock<Logger>())).toThrow("Incorrect duration");
    });

    describe("long mouse down test", () => {
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

        test("that has data handler", () => {
            interaction = new LongMouseDown(1, mock<Logger>());
            expect((interaction.fsm as FSMImpl<FSMDataHandler>).dataHandler).toBeDefined();
        });

        test("that reinit cleans data", () => {
            interaction = new LongMouseDown(100, mock<Logger>());
            jest.spyOn((interaction.fsm as FSMImpl<FSMDataHandler>).dataHandler as FSMDataHandler, "reinitData");
            interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
            interaction.reinit();
            expect(interaction.data.button).toBe(0);
            expect(interaction.data.currentTarget).toBeNull();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect((interaction.fsm as FSMImpl<FSMDataHandler>).dataHandler!.reinitData).toHaveBeenCalledWith();
        });

        describe.each([1000, 2000])("long press %s", duration => {
            beforeEach(() => {
                logger = mock<Logger>();
                interaction = new LongMouseDown(duration, logger);
                interaction.fsm.addHandler(handler);
            });

            test("touch does not end", () => {
                const pressData = new PointDataImpl();

                const newHandler = mock<FSMHandler>();
                newHandler.fsmStarts = jest.fn(() => {
                    pressData.copy(interaction.data);
                });
                interaction.fsm.addHandler(newHandler);
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).not.toHaveBeenCalled();

                expect(pressData.clientX).toBe(160);
                expect(pressData.clientY).toBe(21);
                expect(pressData.screenX).toBe(15);
                expect(pressData.screenY).toBe(20);
                expect(pressData.button).toBe(2);
            });

            test("press with early release", () => {
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mouseup", canvas, 15, 20, 160, 21, 2));
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("press, release with other button with timeout", () => {
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mouseup", canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).not.toHaveBeenCalled();
            });

            test("log interaction is ok", () => {
                interaction.log(true);
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mouseup", canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();

                expect(logger.logInteractionMsg).toHaveBeenCalledTimes(8);
            });

            test("no log interaction is ok", () => {
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mouseup", canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();

                expect(logger.logInteractionMsg).not.toHaveBeenCalled();
            });

            test("two presses with timeout", () => {
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mouseup", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 1));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });

            test("one long press on canvas", () => {
                interaction.registerToNodes([canvas]);
                robot(canvas)
                    .mousedown()
                    .runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).toHaveBeenCalledTimes(0);
            });

            test("mouse move cancels the long pressure", () => {
                interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
                interaction.processEvent(createMouseEvent("mousemove", canvas, 15, 21, 160, 22, 2));
                jest.runOnlyPendingTimers();
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });
        });
    });
});
