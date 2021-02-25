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

import type {FSMDataHandler, FSMHandler} from "../../../src/interacto";
import {LongPress, PointDataImpl} from "../../../src/interacto";
import {createMouseEvent, robot} from "../StubEvents";
import {mock} from "jest-mock-extended";

let interaction: LongPress;
let canvas: HTMLElement;
let handler: FSMHandler;


test("cannot create 0 or less duration", () => {
    expect(() => new LongPress(0)).toThrow("Incorrect duration");
});

describe("long press test", () => {
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
        interaction = new LongPress(200);
        interaction.getFsm().buildFSM();
        expect(interaction.getFsm().getStates()).toHaveLength(4);
    });

    test("that has data handler", () => {
        interaction = new LongPress(1);
        expect(interaction.getFsm().getDataHandler()).toBeDefined();
    });

    test("that reinit cleans data", () => {
        interaction = new LongPress(100);
        jest.spyOn(interaction.getFsm().getDataHandler() as FSMDataHandler, "reinitData");
        interaction.processEvent(createMouseEvent("mousedown", canvas, 15, 20, 160, 21, 2));
        interaction.reinit();
        expect(interaction.getData().button).toStrictEqual(0);
        expect(interaction.getData().currentTarget).toBeNull();
        expect(interaction.getFsm().getDataHandler()?.reinitData).toHaveBeenCalledWith();
    });

    [1000, 2000].forEach(duration => {
        describe(`long press ${String(duration)}`, () => {
            beforeEach(() => {
                interaction = new LongPress(duration);
                interaction.getFsm().addHandler(handler);
            });

            test("touch does not end", () => {
                const pressData = new PointDataImpl();

                const newHandler = mock<FSMHandler>();
                newHandler.fsmStarts.mockImplementation(() => {
                    pressData.copy(interaction.getData());
                });
                interaction.getFsm().addHandler(newHandler);
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
                    .do(() => jest.runOnlyPendingTimers());
                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmStops).toHaveBeenCalledTimes(1);
                expect(handler.fsmCancels).toHaveBeenCalledTimes(0);
            });
        });
    });
});

