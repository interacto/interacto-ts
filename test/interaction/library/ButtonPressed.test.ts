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

import {ButtonPressed} from "../../../src/interacto";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a button pressed interaction", () => {
    let interaction: ButtonPressed;
    let button: HTMLButtonElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new ButtonPressed(logger);
        interaction.fsm.addHandler(handler);
        button = document.createElement("button");
    });

    test("click event start and stop the interaction ButtonPressed", () => {
        interaction.registerToNodes([button]);
        button.click();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([button]);
        button.click();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([button]);
        button.click();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("other event don't trigger the interaction ButtonPressed", () => {
        interaction.registerToNodes([button]);
        robot().change(button);
        expect(handler.fsmStarts).not.toHaveBeenCalled();
    });

    test("cannot register non button", () => {
        const w = document.createElement("a");
        jest.spyOn(w, "addEventListener");
        interaction.onNewNodeRegistered(w);
        expect(w.addEventListener).not.toHaveBeenCalled();
    });

    test("cannot unregister non button", () => {
        const w = document.createElement("a");
        jest.spyOn(w, "removeEventListener");
        interaction.onNodeUnregistered(w);
        expect(w.removeEventListener).not.toHaveBeenCalled();
    });

    test("button contains an img on which user clicks", () => {
        const img = document.createElement("img");
        button.append(img);
        interaction.registerToNodes([button]);

        img.click();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("data ok", () => {
        let data;
        interaction.fsm.addHandler({
            "fsmStops": () => {
                data = interaction.data.widget;
            }
        });
        interaction.registerToNodes([button]);
        button.click();

        expect(data).toBe(button);
    });

    test("data clear ok", () => {
        interaction.registerToNodes([button]);
        button.click();

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.widget).toBeNull();
    });
});
