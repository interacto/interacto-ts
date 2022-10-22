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

import type {FSMHandler, Logger} from "../../../src/interacto";
import {KeyDataImpl, KeyDown} from "../../../src/interacto";
import {robot} from "interacto-nono";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";

describe("using a key down interaction", () => {
    let interaction: KeyDown;
    let text: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new KeyDown(logger, false);
        interaction.fsm.addHandler(handler);
        text = document.createElement("textarea");
    });

    test("type 'a' in the textarea starts and stops the interaction.", () => {
        interaction.registerToNodes([text]);
        robot(text).keydown({"code": "a"});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([text]);
        robot(text).keydown({"code": "a"});

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([text]);
        robot(text).keydown({"code": "a"});

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("the key typed in the textarea is the same key in the data of the interaction.", () => {
        const data = new KeyDataImpl();
        interaction.registerToNodes([text]);
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            data.copy(interaction.data);
        });
        interaction.fsm.addHandler(newHandler);
        robot(text).keydown({"code": "a"});
        expect(data.code).toBe("a");
    });

    test("two Key Press Ends", () => {
        interaction.registerToNodes([text]);
        robot(text)
            .keydown({"code": "a"})
            .keydown({"code": "b"});
        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    });
});
