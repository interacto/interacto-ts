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

import {KeyDataImpl, KeyDown} from "../../../src/interacto";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a key down interaction", () => {
    let interaction: KeyDown;
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
            interaction = new KeyDown(logger, false);
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
        });

        test("type 'a' in the textarea starts and stops the interaction.", () => {
            robot(text).keydown({"code": "a"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("log interaction is ok", () => {
            interaction.log(true);
            robot(text).keydown({"code": "a"});

            expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
        });

        test("no log interaction is ok", () => {
            robot(text).keydown({"code": "a"});

            expect(logger.logInteractionMsg).not.toHaveBeenCalled();
        });

        test("the key typed in the textarea is the same key in the data of the interaction.", () => {
            const data = new KeyDataImpl();
            const newHandler = mock<FSMHandler>();
            newHandler.fsmStops = jest.fn(() => {
                data.copy(interaction.data);
            });
            interaction.fsm.addHandler(newHandler);
            robot(text).keydown({"code": "a"});
            expect(data.code).toBe("a");
        });

        test("two Key Press Ends", () => {
            robot(text)
                .keydown({"code": "a"})
                .keydown({"code": "b"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
            expect(handler.fsmStops).toHaveBeenCalledTimes(2);
        });

        test("clear Data", () => {
            robot(text)
                .keydown({"code": "a"});

            expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
            expect(interaction.data.key).toBe("");
            expect(interaction.data.code).toBe("");
            expect(interaction.data.currentTarget).toBeNull();
        });
    });

    describe("with the key", () => {
        test("press the expected key works", () => {
            interaction = new KeyDown(logger, false, "keyA");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text).keydown({"code": "keyA"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("press the expected key works with modifiers accepted", () => {
            interaction = new KeyDown(logger, true, "keyB");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text).keydown({"code": "keyB"});
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("press an unexpected key works", () => {
            interaction = new KeyDown(logger, false, "keyU");
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([text]);
            robot(text).keydown({"code": "keyT"});
            expect(handler.fsmStarts).not.toHaveBeenCalled();
        });
    });
});
