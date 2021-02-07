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

import {Redo} from "../../../src/impl/command/library/Redo";
import {UndoHistory} from "../../../src/impl/undo/UndoHistory";
import {Undoable} from "../../../src/api/undo/Undoable";
import {mock, MockProxy} from "jest-mock-extended";

let cmd: Redo;
let collector: MockProxy<UndoHistory> & UndoHistory;


describe("base redo testing", () => {
    beforeEach(() => {
        cmd = new Redo();
        collector = mock<UndoHistory>();
        UndoHistory.setInstance(collector);
        UndoHistory.getInstance = jest.fn().mockImplementation(() => collector);
    });

    afterAll(() => {
        UndoHistory.setInstance(new UndoHistory());
    });

    test("testCannotDo", () => {
        collector.getLastRedo.mockReturnValue(undefined);
        expect(cmd.canExecute()).toBeFalsy();
    });

    describe("with undoable", () => {
        let undoable: Undoable;

        beforeEach(() => {
            undoable = mock<Undoable>();
            collector.getLastRedo.mockReturnValue(undoable);
        });

        test("testCanDo", () => {
            expect(cmd.canExecute()).toBeTruthy();
        });

        test("testDo", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            expect(collector.redo).toHaveBeenCalledTimes(1);
        });

        test("testHadEffects", () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            cmd.execute();
            cmd.done();
            expect(cmd.hadEffect()).toBeTruthy();
        });
    });
});
