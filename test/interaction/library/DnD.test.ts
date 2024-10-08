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

import {DnD} from "../../../src/interacto";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a DnD interaction", () => {
    let interaction: DnD;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new DnD(false, logger);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
    });

    test("is not running at start", () => {
        expect(interaction.isRunning()).toBeFalsy();
    });

    test("is running on press", () => {
        interaction.registerToNodes([canvas]);
        robot().mousedown(canvas);
        expect(interaction.isRunning()).toBeTruthy();
    });

    test("press event don't trigger the interaction DnD", () => {
        interaction.registerToNodes([canvas]);
        robot().mousedown(canvas);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("press and release without moving don't trigger the interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mouseup();
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("data of the  press and drag part of the interaction", () => {
        let tx: number | undefined;
        let ty: number | undefined;
        let sx: number | undefined;
        let sy: number | undefined;
        let button: number | undefined;
        let obj: HTMLCanvasElement | undefined;

        interaction.registerToNodes([canvas]);
        robot(canvas).mousedown({"screenX": 1, "screenY": 2, "clientX": 15, "clientY": 20, "button": 0});
        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates = jest.fn(() => {
            sx = interaction.data.src.clientX;
            sy = interaction.data.src.clientY;
            tx = interaction.data.tgt.clientX;
            ty = interaction.data.tgt.clientY;
            button = interaction.data.src.button;
            obj = interaction.data.tgt.currentTarget as HTMLCanvasElement;
        });
        interaction.fsm.addHandler(newHandler);
        robot(canvas).mousemove({"screenX": 3, "screenY": 4, "clientX": 16, "clientY": 21, "button": 0});
        expect(sx).toBe(15);
        expect(sy).toBe(20);
        expect(tx).toBe(16);
        expect(ty).toBe(21);
        expect(button).toBe(0);
        expect(obj).toBe(canvas);
    });

    test("check if drag with different button don't cancel or stop the interaction.", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown({"button": 0})
            .mousemove({"button": 2})
            .mousemove({"button": 0});

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("check if drag with different button don't cancel or stop the interaction-bis.", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown({"button": 0})
            .mousemove({"button": 0})
            .mousemove({"button": 2});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("press one button and release a different one don't trigger the interaction.", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown({"button": 0})
            .mouseup({"button": 2});
        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("press and drag start the interaction but don't cancel it or stop it", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("press and drag multiple time start the interaction but don't cancel it or stop it", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("check data with multiple drag", () => {
        let tx: number | undefined;
        let ty: number | undefined;
        let sx: number | undefined;
        let sy: number | undefined;
        let button: number | undefined;
        let obj: HTMLCanvasElement | undefined;

        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown({"screenX": 1, "screenY": 2, "clientX": 11, "clientY": 23, "button": 0})
            .mousemove({"screenX": 3, "screenY": 4, "clientX": 12, "clientY": 22, "button": 0});

        interaction.fsm.addHandler({
            "fsmUpdates": () => {
                sx = interaction.data.src.clientX;
                sy = interaction.data.src.clientY;
                tx = interaction.data.tgt.clientX;
                ty = interaction.data.tgt.clientY;
                button = interaction.data.src.button;
                obj = interaction.data.tgt.currentTarget as HTMLCanvasElement;
            }
        });

        robot(canvas)
            .mousemove({"screenX": 3, "screenY": 4, "clientX": 12, "clientY": 24, "button": 0});
        expect(sx).toBe(11);
        expect(sy).toBe(23);
        expect(tx).toBe(12);
        expect(ty).toBe(24);
        expect(obj).toBe(canvas);
        expect(button).toBe(0);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("click and move and release start and stop the interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mouseup();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("release with a different key that the one use to press and drag don't cancel or stop the interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mouseup({"button": 2});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("click, multiple move and release start and stop the interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .mouseup();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .mouseup();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(9);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .mouseup();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("check data with one move.", () => {
        let tx: number | undefined;
        let ty: number | undefined;
        let sx: number | undefined;
        let sy: number | undefined;

        interaction.registerToNodes([canvas]);
        interaction.fsm.addHandler({
            "fsmStops": () => {
                sx = interaction.data.src.clientX;
                sy = interaction.data.src.clientY;
                tx = interaction.data.tgt.clientX;
                ty = interaction.data.tgt.clientY;
            }
        });
        robot(canvas)
            .keepData()
            .mousedown({"screenX": 1, "screenY": 2, "clientX": 11, "clientY": 23, "button": 0})
            .mousemove({"screenX": 3, "screenY": 4, "clientX": 15, "clientY": 25})
            .mouseup();
        expect(sx).toBe(11);
        expect(sy).toBe(23);
        expect(tx).toBe(15);
        expect(ty).toBe(25);
    });

    test("displacement data", () => {
        let diffClientX: number | undefined;
        let diffClientY: number | undefined;
        let diffScreenX: number | undefined;
        let diffScreenY: number | undefined;

        interaction.fsm.addHandler({
            "fsmStops": () => {
                diffClientX = interaction.data.diffClientX;
                diffClientY = interaction.data.diffClientY;
                diffScreenX = interaction.data.diffScreenX;
                diffScreenY = interaction.data.diffScreenY;
            }
        });

        interaction.registerToNodes([canvas]);

        robot(canvas)
            .keepData()
            .mousedown({"screenX": 1, "screenY": 2, "clientX": 11, "clientY": 23, "button": 0})
            .mousemove({"screenX": 3, "screenY": 4, "clientX": 15, "clientY": 25})
            .mouseup();
        expect(diffClientX).toBe(4);
        expect(diffClientY).toBe(2);
        expect(diffScreenX).toBe(2);
        expect(diffScreenY).toBe(2);
    });

    test("clear Data", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .mouseup();

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.src.clientX).toBe(0);
        expect(interaction.data.tgt.clientY).toBe(0);
        expect(interaction.data.src.buttons).toBe(0);
        expect(interaction.data.src.currentTarget).toBeNull();
        expect(interaction.data.tgt.target).toBeNull();
    });
});
