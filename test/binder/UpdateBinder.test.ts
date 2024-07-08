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

import {UpdateBinder} from "../../src/impl/binder/UpdateBinder";
import {MouseDown} from "../../src/impl/interaction/library/MouseDown";
import {UndoHistoryImpl} from "../../src/impl/undo/UndoHistoryImpl";
import { afterEach, beforeEach, describe, expect, test, jest } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {BindingsObserver} from "../../src/api/binding/BindingsObserver";
import type {Command} from "../../src/api/command/Command";
import type {Interaction} from "../../src/api/interaction/Interaction";
import type {InteractionData} from "../../src/api/interaction/InteractionData";
import type {Logger} from "../../src/api/logging/Logger";
import type {UndoHistory} from "../../src/api/undo/UndoHistory";

describe("using an update binder", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let binder: UpdateBinder<Command, Interaction<any>, unknown>;
    let history: UndoHistory;

    beforeEach(() => {
        history = new UndoHistoryImpl();
        binder = new UpdateBinder(history, mock<Logger>());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("that is crashes when calling bind without an interaction supplier", () => {
        expect(() => binder.bind()).toThrow("The interaction supplier cannot be undefined here");
    });

    test("that is crashes when calling bind without a command supplier", () => {
        binder = binder.usingInteraction(() => mock<Interaction<InteractionData>>());
        expect(() => binder.bind()).toThrow("The command supplier cannot be undefined here");
    });

    test("that observer is used on bind", () => {
        const obs = mock<BindingsObserver>();
        binder = new UpdateBinder(history, mock<Logger>(), obs)
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => mock<Command>() as Command);

        const binding = binder.bind();
        expect(obs.observeBinding).toHaveBeenCalledTimes(1);
        expect(obs.observeBinding).toHaveBeenCalledWith(binding);
    });
});
