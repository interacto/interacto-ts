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

import {mock} from "jest-mock-extended";
import type {FSMHandler} from "../../../src/api/fsm/FSMHandler";
import {Clicks} from "../../../src/impl/interaction/library/Clicks";
import {createMouseEvent} from "../StubEvents";
import {robot} from "interacto-nono";

let interaction: Clicks;
let canvas: HTMLElement;
let handler: FSMHandler;


test("cannot build the interaction with 0 click", () => {
    expect(() => new Clicks(0)).toThrow("The number of clicks must be greater than 1");
});

test("cannot build the interaction with 1 click", () => {
    expect(() => new Clicks(1)).toThrow("For a number of clicks that equals 1, use the Click interaction");
});


[3, 4].forEach(nb => {
    describe(`testing clicks with ${nb} clicks`, () => {
        beforeEach(() => {
            jest.useFakeTimers();
            handler = mock<FSMHandler>();
            canvas = document.createElement("canvas");
            interaction = new Clicks(nb);
            interaction.fsm.addHandler(handler);
        });

        afterEach(() => {
            interaction.uninstall();
            jest.clearAllMocks();
            jest.clearAllTimers();
        });

        test("cannot build the interaction twice", () => {
            interaction.fsm.buildFSM();
            expect(interaction.fsm.states).toHaveLength(4);
        });

        // slice(1) to remove 0
        // Array(nb).keys() to have [0, 1, 2] or [0, 1, 2, 3]
        [...Array(nb).keys()].slice(1).forEach(nbClick => {
            test(`that ${nbClick} on ${nb} is not enough`, () => {
                [...Array(nbClick).keys()].forEach(_ => {
                    interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 2));
                });

                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmUpdates).toHaveBeenCalledTimes(nbClick);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).not.toHaveBeenCalled();
            });

            test(`that ${nbClick} on ${nb} is not enough with timeout`, () => {
                [...Array(nbClick).keys()].forEach(_ => {
                    interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
                });
                jest.runAllTimers();

                expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
                expect(handler.fsmUpdates).toHaveBeenCalledTimes(nbClick);
                expect(handler.fsmStops).not.toHaveBeenCalled();
                expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            });
        });

        test(`that ${nb} clicks is OK`, () => {
            [...Array(nb).keys()].forEach(_ => {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            });

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(nb - 1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test(`that ${nb} clicks is OK two times`, () => {
            [...Array(nb).keys()].forEach(_ => {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            });
            jest.runAllTimers();
            [...Array(nb).keys()].forEach(_ => {
                interaction.processEvent(createMouseEvent("click", canvas, 15, 21, 160, 21, 3));
            });
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

