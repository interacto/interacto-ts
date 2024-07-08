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

import {KeyDataImpl, KeyTyped} from "../../../src/interacto";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a key typed interaction", () => {
    let interaction: KeyTyped;
    let text: HTMLElement;
    let handler: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        text = document.createElement("textarea");
    });

    afterEach(() => {
        interaction.uninstall();
        jest.clearAllMocks();
    });

    describe("without the key", () => {
        beforeEach(() => {
            interaction = new KeyTyped(logger);
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
        });

        test("type 'a' in the textarea starts and stops the interaction.", () => {
            robot(text)
                .keepData()
                .keydown({"code": "a"})
                .keyup();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            robot(text)
                .keepData()
                .keydown({"code": "a"})
                .keyup();

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(5);
        });

        test("no log interaction is ok", () => {
            robot(text)
                .keepData()
                .keydown({"code": "a"})
                .keyup();

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test("only press the key don't stop the interaction.", () => {
            robot(text)
                .keydown({"code": "a"});
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("if you release a key different that the one you press, the interaction don't stop", () => {
            robot(text)
                .keydown({"code": "a"})
                .keyup({"code": "b"});
            expect(handler.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("data is ok", () => {
            const data = new KeyDataImpl();
            const newHandler = mock<FSMHandler>();
            newHandler.fsmStops = jest.fn(() => {
                data.copy(interaction.data);
            });
            interaction.fsm.addHandler(newHandler);
            robot(text)
                .keepData()
                .keydown({"code": "z"})
                .keyup();
            expect(data.code).toBe("z");
        });
    });

    describe("with the key", () => {
        test("type the expected key works.", () => {
            interaction = new KeyTyped(logger, "KeyQ");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text)
                .keepData()
                .keydown({"code": "KeyQ"})
                .keyup();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("type an unexpected key works.", () => {
            interaction = new KeyTyped(logger, "KeyT");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text)
                .keepData()
                .keydown({"code": "KeyI"})
                .keyup();
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });

        test("type expected Escape works.", () => {
            interaction = new KeyTyped(logger, "Escape");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text)
                .keepData()
                .keydown({"code": "Escape"})
                .keyup();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });
});
