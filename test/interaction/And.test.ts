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

import {rightPan, Then} from "../../src/interacto";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {Logger} from "../../src/api/logging/Logger";
import type {FSMHandler, SrcTgtPointsData, TouchData, TouchDnD} from "../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("that then interaction works", () => {
    const theLogger: Logger & MockProxy<Logger> = mock<Logger>();
    let canvas: HTMLElement;
    let interaction: Then<[TouchDnD, TouchDnD],
    [SrcTgtPointsData<TouchData>, SrcTgtPointsData<TouchData>]>;
    let handler: FSMHandler;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        canvas = document.createElement("canvas");
        jest.useFakeTimers();
        interaction = new Then<[TouchDnD, TouchDnD],
        [SrcTgtPointsData<TouchData>, SrcTgtPointsData<TouchData>]>(
            [rightPan(theLogger, false, 10, 100)(), rightPan(theLogger, false, 10, 100)()], theLogger);

        interaction.fsm.addHandler(handler);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        interaction.uninstall();
    });

    test("when a single swipe right", () => {
        robot(canvas)
            .pan(1, 200, "right", {clientX: 0, clientY: 0});

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
    });

    test("when double swipe right", () => {
        robot(canvas)
            .pan(1, 200, "right", {clientX: 0, clientY: 0})
            .pan(2, 200, "right", {clientX: 0, clientY: 0});

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});

