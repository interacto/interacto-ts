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

import {MouseUp} from "../../../src/interacto";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a mouse up interaction", () => {
    let interaction: MouseUp;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new MouseUp(logger);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
    });

    test("press on the canvas starts and stops MouseUp interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas).mouseup();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([canvas]);
        robot(canvas).mouseup();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas).mouseup();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });
});
