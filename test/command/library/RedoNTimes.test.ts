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

import {RedoNTimes} from "../../../src/impl/command/library/RedoNTimes";
import { beforeEach, describe, expect, test } from "@jest/globals";
import {mock} from "jest-mock-extended";
import type {Undoable} from "../../../src/api/undo/Undoable";
import type {UndoHistory} from "../../../src/api/undo/UndoHistory";
import type {MockProxy} from "jest-mock-extended";

let cmd: RedoNTimes;
let collector: MockProxy<UndoHistory> & UndoHistory;

describe("base redo testing", () => {
    beforeEach(() => {
        collector = mock<UndoHistory>();
        cmd = new RedoNTimes(collector, 2);
    });

    test("cannotDo", () => {
        collector.getRedo.mockReturnValue(new Array<Undoable>());
        expect(cmd.canExecute()).toBeFalsy();
    });

    describe("with undoables", () => {
        let undoables: Array<Undoable>;

        beforeEach(() => {
            undoables = new Array<Undoable>();
            undoables.push(mock<Undoable>(), mock<Undoable>(), mock<Undoable>());
            collector.getRedo.mockReturnValue(undoables);
        });

        test("canDo", () => {
            expect(cmd.canExecute()).toBeTruthy();
        });

        test("do", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            expect(collector.redo).toHaveBeenCalledTimes(2);
        });

        test("hadEffects", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            cmd.done();
            expect(cmd.hadEffect()).toBeTruthy();
        });
    });
});
