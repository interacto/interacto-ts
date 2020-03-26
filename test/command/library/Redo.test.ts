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

import { Redo } from "../../../src/command/library/Redo";
import { UndoCollector } from "../../../src/undo/UndoCollector";
import { Undoable } from "../../../src/undo/Undoable";

jest.mock("../../../src/undo/UndoCollector");

let cmd: Redo;
let collector: UndoCollector;


describe("base redo testing", () => {
    beforeEach(() => {
        cmd = new Redo();
        collector = new UndoCollector();
        UndoCollector.setInstance(collector);
        UndoCollector.getInstance = jest.fn().mockImplementation(() => collector);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("testCannotDo", () => {
        collector.getLastRedo = jest.fn().mockImplementation(() => undefined);
        expect(cmd.canDo()).toBeFalsy();
    });

    describe("with undoable", () => {
        let undoable: Undoable;

        beforeEach(() => {
            undoable = {} as Undoable;
            collector.getLastRedo = jest.fn().mockImplementation(() => undoable);
        });

        test("testCanDo", () => {
            expect(cmd.canDo()).toBeTruthy();
        });

        test("testDo", () => {
            cmd.doIt();
            expect(collector.redo).toHaveBeenCalledTimes(1);
        });

        test("testHadEffects", () => {
            cmd.doIt();
            cmd.done();
            expect(cmd.hadEffect()).toBeTruthy();
        });
    });
})
