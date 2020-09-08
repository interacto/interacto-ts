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

import {Undo} from "../../../src/command/library/Undo";
import {UndoCollector} from "../../../src/undo/UndoCollector";
import {Undoable} from "../../../src/undo/Undoable";

jest.mock("../../../src/undo/UndoCollector");

let cmd: Undo;
let collector: UndoCollector;


describe("base undo testing", () => {
    beforeEach(() => {
        cmd = new Undo();
        collector = new UndoCollector();
        UndoCollector.setInstance(collector);
        UndoCollector.getInstance = jest.fn().mockImplementation(() => collector);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("testCannotDo", () => {
        collector.getLastUndo = jest.fn().mockImplementation(() => undefined);
        expect(cmd.canDo()).toBeFalsy();
    });

    describe("with undoable", () => {
        let undoable: Undoable;

        beforeEach(() => {
            undoable = {} as Undoable;
            collector.getLastUndo = jest.fn().mockImplementation(() => undoable);
        });

        test("testCanDo", () => {
            expect(cmd.canDo()).toBeTruthy();
        });

        test("testDo", () => {
            cmd.doIt();
            expect(collector.undo).toHaveBeenCalledTimes(1);
        });

        test("testHadEffects", () => {
            cmd.doIt();
            cmd.done();
            expect(cmd.hadEffect()).toBeTruthy();
        });
    });
});
