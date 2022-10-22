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

import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import type {FSMHandler} from "../../../src/api/fsm/FSMHandler";
import {Clicks} from "../../../src/impl/interaction/library/Clicks";
import {createMouseEvent} from "../StubEvents";
import {robot} from "interacto-nono";
import type {LoggerImpl} from "../../../src/impl/logging/LoggerImpl";
import type {Logger} from "../../../src/api/logging/Logger";

describe("using a clicks interaction", () => {
    let interaction: Clicks;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    test("cannot build the interaction with 0 click", () => {
        expect(() => new Clicks(0, mock<LoggerImpl>())).toThrow("The number of clicks must be greater than 1");
    });

    test("cannot build the interaction with 1 click", () => {
        expect(() => new Clicks(1, mock<LoggerImpl>())).toThrow("For a number of clicks that equals 1, use the Click interaction");
    });

    describe.each([3, 4])("testing clicks with %s clicks", nb => {
        beforeEach(() => {
            jest.useFakeTimers();
            handler = mock<FSMHandler>();
            logger = mock<Logger>();
            canvas = document.createElement("canvas");
            interaction = new Clicks(nb, logger);
            interaction.fsm.addHandler(handler);
        });

        afterEach(() => {
            interaction.uninstall();
            jest.clearAllMocks();
            jest.clearAllTimers();
        });

        // slice(1) to remove 0
        // Array(nb).keys() to have [0, 1, 2] or [0, 1, 2, 3]
        test.each(Array.from(Array.from({"length": nb}).keys()).slice(1))(`that %s on ${nb} is not enough`, nbClick => {
            for (let i = 0; i < nbClick; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 2));
            }

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(nbClick);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test.each(Array.from(Array.from({"length": nb}).keys()).slice(1))(`that %s on ${nb} is not enough with timeout`, nbClick => {
            for (let i = 0; i < nbClick; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }
            jest.runAllTimers();

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(nbClick);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test(`that ${nb} clicks is OK`, () => {
            for (let i = 0; i < nb; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(nb - 1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            for (let i = 0; i < nb; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4 * nb);
        });

        test("no log interaction is ok", () => {
            for (let i = 0; i < nb; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test(`that ${nb} clicks is OK two times`, () => {
            for (let i = 0; i < nb; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }
            jest.runAllTimers();
            for (let i = 0; i < nb; i++) {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            }
            jest.runAllTimers();

            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        });

        test("that data first click ok", () => {
            interaction.processEvent(createMouseEvent("click", canvas, 125, 21, 140, 121, 1));

            const data = interaction.data.points;

            expect(data).toHaveLength(1);
            expect(data[0].clientX).toBe(140);
            expect(data[0].clientY).toBe(121);
            expect(data[0].screenX).toBe(125);
            expect(data[0].screenY).toBe(21);
            expect(data[0].button).toBe(1);
        });

        test("that data two clicks ok", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"screenX": 1025, "screenY": 210, "clientX": 1040, "clientY": 1201, "button": 1})
                .click({"screenX": 1250, "screenY": 201, "clientX": 1040, "clientY": 1021, "button": 1});

            const data = interaction.data.points;

            expect(data).toHaveLength(2);
            expect(data[0].clientX).toBe(1040);
            expect(data[0].clientY).toBe(1201);
            expect(data[0].screenX).toBe(1025);
            expect(data[0].screenY).toBe(210);
            expect(data[0].button).toBe(1);
            expect(data[1].clientX).toBe(1040);
            expect(data[1].clientY).toBe(1021);
            expect(data[1].screenX).toBe(1250);
            expect(data[1].screenY).toBe(201);
            expect(data[1].button).toBe(1);
        });
    });
});
