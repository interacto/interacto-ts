/*
 * Interacto
 * Copyright (C) 2019 Arnaud Blouin
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {UndoableCommand} from "../../src/impl/command/UndoableCommand";

let cmd: UndoableCommand;

class ExampleUndoableCmd extends UndoableCommand {
    protected execution(): Promise<void> | void {
        return undefined;
    }

    public redo(): void {
    }

    public undo(): void {
    }
}

beforeEach(() => {
    cmd = new ExampleUndoableCmd();
});

test("get UndoName", () => {
    expect(cmd.getUndoName()).toBe("ExampleUndoableCmd");
});

test("get VisualSnapshot", () => {
    expect(cmd.getVisualSnapshot()).toBeUndefined();
});

