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

import {Undo} from "../../../src/impl/command/library/Undo";
import type {Undoable} from "../../../src/api/undo/Undoable";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import type {UndoHistory} from "../../../src/api/undo/UndoHistory";

let cmd: Undo;
let collector: MockProxy<UndoHistory> & UndoHistory;

describe("base undo testing", () => {
    beforeEach(() => {
        collector = mock<UndoHistory>();
        cmd = new Undo(collector);
    });

    test("cannotDo", () => {
        collector.getLastUndo.mockReturnValue(undefined);
        expect(cmd.canExecute()).toBeFalsy();
    });

    describe("with undoable", () => {
        let undoable: Undoable;

        beforeEach(() => {
            undoable = mock<Undoable>();
            collector.getLastUndo.mockReturnValue(undoable);
        });

        test("canDo", () => {
            expect(cmd.canExecute()).toBeTruthy();
        });

        test("do", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            expect(collector.undo).toHaveBeenCalledTimes(1);
        });

        test("hadEffects", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            cmd.done();
            expect(cmd.hadEffect()).toBeTruthy();
        });
    });
});
