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

import {DragLock} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a drag lock interaction", () => {
    let interaction: DragLock;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let tx: number | undefined;
    let ty: number | undefined;
    let sx: number | undefined;
    let sy: number | undefined;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        jest.useFakeTimers();
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
    });

    describe("using a standard draglock", () => {
        beforeEach(() => {
            interaction = new DragLock(logger);
            interaction.fsm.addHandler(handler);
        });

        test("drag lock is ok", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .click({}, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .click({}, 2, false);

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(28);
        });

        test("no log interaction is ok", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .click({}, 2, false);

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test("drag lock requires a least a move", () => {
            interaction.registerToNodes([canvas]);
            robot().click(canvas, 4, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("drag lock canceled on ESC", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .keydown({"code": "27"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        });

        test("check data with a normal execution", () => {
            interaction.registerToNodes([canvas]);
            const newHandler = mock<FSMHandler>();
            newHandler.fsmStops = jest.fn(() => {
                sx = interaction.data.src.clientX;
                sy = interaction.data.src.clientY;
                tx = interaction.data.tgt.clientX;
                ty = interaction.data.tgt.clientY;
            });
            interaction.fsm.addHandler(newHandler);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23}, 2, false)
                .mousemove({"clientX": 20, "clientY": 30})
                .click({"clientX": 22, "clientY": 33}, 2, false);

            expect(sx).toBe(11);
            expect(sy).toBe(23);
            expect(tx).toBe(22);
            expect(ty).toBe(33);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("check update work during move", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove();
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        });

        test("check data update during a move", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas).click({"clientX": 11, "clientY": 23}, 2, false);
            const newHandler = mock<FSMHandler>();
            newHandler.fsmUpdates = jest.fn(() => {
                tx = interaction.data.tgt.clientX;
                ty = interaction.data.tgt.clientY;
            });
            interaction.fsm.addHandler(newHandler);
            robot(canvas).mousemove({"clientX": 30, "clientY": 40});
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(tx).toBe(30);
            expect(ty).toBe(40);
        });

        test("check data reinitialisation", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .click({}, 2, false);
            expect(interaction.data.src.clientX).toBe(0);
            expect(interaction.data.src.clientY).toBe(0);
            expect(interaction.data.tgt.clientX).toBe(0);
            expect(interaction.data.tgt.clientY).toBe(0);
        });

        test("check if canceled with Esc after a move", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .keydown({"code": "27"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("check if the last DoubleClick with a different button don't stop the interaction", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"button": 1}, 2, false)
                .click({"button": 0}, 2, false);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("specific mouse button checking OK", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 3}, 2, false)
                .mousemove({"clientX": 20, "clientY": 30})
                .click({"clientX": 22, "clientY": 33, "button": 3}, 2, false);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("several moves ok", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 3}, 2, false)
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30});

            expect(handler.fsmUpdates).toHaveBeenCalledTimes(5);
        });

        test("several moves ok with specific mouse button", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .mousemove({"clientX": 20, "clientY": 30})
                .click({"clientX": 11, "clientY": 33, "button": 2}, 2, false);

            expect(handler.fsmUpdates).toHaveBeenCalledTimes(7);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("timeout first double click", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 1}, 1, false)
                .runOnlyPendingTimers()
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        });

        test("timeout first Click Update Still OK", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 1}, 1, false)
                .runOnlyPendingTimers()
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 21, "clientY": 30})
                .mousemove({"clientX": 21, "clientY": 30});

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("timeout first Click end Still OK", () => {
            interaction.log(true);
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 1}, 1, false)
                .runOnlyPendingTimers()
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 21, "clientY": 30})
                .mousemove({"clientX": 21, "clientY": 30})
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("timeout Second Click KO", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 21, "clientY": 30, "button": 2})
                .click({"clientX": 11, "clientY": 23, "button": 2}, 1, false)
                .runOnlyPendingTimers()
                .click({"clientX": 11, "clientY": 23, "button": 2}, 1, false);

            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("timeout Second Click OK", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 21, "clientY": 30, "button": 2})
                .click({"clientX": 11, "clientY": 23, "button": 2}, 1, false)
                .runOnlyPendingTimers()
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("first Click Has target object", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false);

            expect(interaction.data.tgt.target).toBe(canvas);
        });

        test("first Click Has target Values", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false);

            expect(interaction.data.tgt.clientX).toBe(11);
            expect(interaction.data.tgt.clientY).toBe(23);
            expect(interaction.data.src.button).toBe(2);
        });

        test("move Has Still Src Values", () => {
            interaction.registerToNodes([canvas]);

            robot(canvas)
                .click({"clientX": 11, "clientY": 23, "button": 2}, 2, false)
                .mousemove({"clientX": 21, "clientY": 30, "button": 2});

            expect(interaction.data.tgt.clientX).toBe(21);
            expect(interaction.data.tgt.clientY).toBe(30);
            expect(interaction.data.src.clientX).toBe(11);
            expect(interaction.data.src.clientY).toBe(23);
            expect(interaction.data.src.button).toBe(2);
        });

        test("clear Data", () => {
            interaction.registerToNodes([canvas]);
            robot()
                .click(canvas, 2, false)
                .mousemove()
                .click({}, 2, false);

            expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
            expect(interaction.data.src.screenX).toBe(0);
            expect(interaction.data.tgt.screenY).toBe(0);
            expect(interaction.data.src.pageX).toBe(0);
            expect(interaction.data.src.target).toBeNull();
            expect(interaction.data.tgt.currentTarget).toBeNull();
        });
    });


    describe("using a draglock having a threshold", () => {
        beforeEach(() => {
            interaction = new DragLock(logger, undefined, 10);
            interaction.fsm.addHandler(handler);
        });

        test("drag lock KO if move during first click beyond threshold", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .mousedown({"clientX": 0, "clientY": 0, "button": 2})
                .mouseup({"clientX": 11, "clientY": 0, "button": 2})
                .mousemove();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });

        test("drag lock KO if move during second click beyond threshold", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": 0, "button": 2}, 2, false)
                .mousemove({"clientX": 0, "clientY": 30})
                .mousedown({"clientX": 0, "clientY": 30, "button": 2})
                .mousemove({"clientX": 0, "clientY": 41})
                .mouseup({"clientX": 0, "clientY": 41, "button": 2})
                .click({"clientX": 0, "clientY": 30, "button": 2}, 1, false);


            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("drag lock KO if move during second click beyond threshold 2", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": 0, "button": 2}, 2, false)
                .mousemove({"clientX": 0, "clientY": 30})
                .mousedown({"clientX": 0, "clientY": 30, "button": 2})
                .mousemove({"clientX": 0, "clientY": 41})
                .mouseup({"clientX": 0, "clientY": 41, "button": 2})
                .click({"clientX": 0, "clientY": 41, "button": 2}, 2, false);

            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });

        test("drag lock OK if move during second click beyond threshold", () => {
            interaction.registerToNodes([canvas]);
            robot(canvas)
                .click({"clientX": 0, "clientY": 0, "button": 2}, 2, false)
                .mousemove({"clientX": 0, "clientY": 30})
                .mousedown({"clientX": 0, "clientY": 30, "button": 2})
                .mousemove({"clientX": 0, "clientY": 39})
                .mouseup({"clientX": 0, "clientY": 39, "button": 2})
                .click({"clientX": 0, "clientY": 39, "button": 2}, 1, false);


            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        });
    });
});
