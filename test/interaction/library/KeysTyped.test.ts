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

import {KeysDataImpl, KeysTyped} from "../../../src/interacto";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, KeyData, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a keys typed interaction", () => {
    let interaction: KeysTyped;
    let text: HTMLElement;
    let handler: FSMHandler;
    let data: KeysDataImpl;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        jest.useFakeTimers();
        data = new KeysDataImpl();
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new KeysTyped(logger);
        interaction.fsm.addHandler(handler);
        text = document.createElement("textarea");
    });

    test("type 'b' and wait for timeout stops the interaction", () => {
        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup();
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup();
        jest.runOnlyPendingTimers();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(7);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup();
        jest.runOnlyPendingTimers();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("type 'b' and wait for timeout stops the interaction: data", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            data.addKey(interaction.data.keys.at(-1) as KeyData);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup();
        jest.runOnlyPendingTimers();
        expect(data.keys).toHaveLength(1);
        expect(data.keys[0].code).toBe("b");
    });

    test("type text and wait for timeout stops the interaction", () => {
        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup()
            .keydown({"code": "c"})
            .keyup()
            .keydown({"code": "a"})
            .keyup();
        jest.runOnlyPendingTimers();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(3);
    });

    test("type text and wait for timeout stops the interaction: data", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            for (const k of interaction.data.keys) {
                data.addKey(k);
            }
        });
        interaction.fsm.addHandler(newHandler);

        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup()
            .keydown({"code": "c"})
            .keyup()
            .keydown({"code": "a"})
            .keyup();
        jest.runOnlyPendingTimers();
        expect(data.keys).toHaveLength(3);
        expect(data.keys[0].code).toBe("b");
        expect(data.keys[1].code).toBe("c");
        expect(data.keys[2].code).toBe("a");
    });

    test("type 'b' does not stop the interaction", () => {
        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates = jest.fn(() => {
            data.addKey(interaction.data.keys.at(-1) as KeyData);
        });
        interaction.fsm.addHandler(newHandler);

        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "z"})
            .keyup();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalledWith();
        expect(data.keys).toHaveLength(1);
        expect(data.keys[0].code).toBe("z");
    });

    test("clear Data", () => {
        interaction.registerToNodes([text]);
        robot(text)
            .keepData()
            .keydown({"code": "b"})
            .keyup()
            .keydown({"code": "a"})
            .keyup();
        jest.runOnlyPendingTimers();

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.keys).toHaveLength(0);
    });
});
