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

import {DnD, KeyDown, Not} from "../../src/interacto";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger, PointData, SrcTgtPointsData, SrcTgtPointsDataImpl} from "../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("testing a combining and cancelling interaction", () => {
    let canvas: HTMLElement;
    let logger: Logger & MockProxy<Logger>;
    let handler: FSMHandler;
    let handler1: FSMHandler;
    let handler2: FSMHandler;
    let dnd: DnD;
    let key: KeyDown;
    let interaction: Not<DnD, KeyDown, SrcTgtPointsData<PointData>, SrcTgtPointsDataImpl>;

    beforeEach(() => {
        dnd = new DnD(false, logger);
        key = new KeyDown(logger, false);
        interaction = new Not<DnD, KeyDown>(dnd, key, logger, "");
        handler = mock<FSMHandler>();
        handler1 = mock<FSMHandler>();
        handler2 = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
        jest.useFakeTimers();
        dnd.fsm.addHandler(handler1);
        key.fsm.addHandler(handler2);
        interaction.fsm.addHandler(handler);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        interaction.uninstall();
    });

    test("cancels correctly", () => {
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .keydown();

        expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
        expect(handler1.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("stops correctly", () => {
        robot(canvas)
            .mousedown()
            .mousemove()
            .mousemove()
            .mouseup();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("sets data correctly", () => {
        robot(canvas)
            .mousedown({"screenX": 1, "screenY": 4, "clientX": 111, "clientY": 234, "button": 1})
            .mousemove({"screenX": 2, "screenY": 5, "clientX": 112, "clientY": 235, "button": 1})
            .mousemove({"screenX": 3, "screenY": 6, "clientX": 113, "clientY": 236, "button": 1});

        expect(interaction.data.src.button).toBe(1);
        expect(interaction.data.tgt.button).toBe(1);
        expect(interaction.data.src.screenY).toBe(4);
        expect(interaction.data.tgt.screenY).toBe(6);
    });
});

