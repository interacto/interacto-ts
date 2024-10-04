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

import {TouchDataImpl, TouchStart} from "../../../src/interacto";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a TouchStart interaction", () => {
    let interaction: TouchStart;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new TouchStart(logger);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
    });

    test("touch on the canvas starts and stops TouchStart interaction", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas).touchstart({}, [{"identifier": 2}]);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([canvas]);
        robot(canvas).touchstart({}, [{"identifier": 1}]);

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas).touchstart({}, [{"identifier": 2}]);

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("data ok", () => {
        const touch = new TouchDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStarts = jest.fn(() => {
            touch.copy(interaction.data);
        });
        interaction.fsm.addHandler(newHandler);
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 5, "screenX": 24, "screenY": 20, "clientX": 15, "clientY": 21}]);

        expect(touch.allTouches).toHaveLength(1);
        expect(touch.screenX).toBe(24);
        expect(touch.clientX).toBe(15);
        expect(touch.target).toBe(canvas);
    });

    test("data clear ok", () => {
        interaction.registerToNodes([canvas]);
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}]);

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.allTouches).toHaveLength(0);
        expect(interaction.data.screenX).toBe(0);
        expect(interaction.data.target).toBeNull();
    });
});
