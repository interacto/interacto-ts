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

import {CommandBase} from "../CommandBase";
import type {UndoHistory} from "../../../api/undo/UndoHistory";

/**
 * An Undo command that undoes the last N commands.
 * @category Command
 */
export class UndoNTimes extends CommandBase {
    protected readonly history: UndoHistory;

    protected readonly numberOfUndos: number;

    public constructor(undoHistory: UndoHistory, numberOfUndos: number) {
        super();
        this.history = undoHistory;
        this.numberOfUndos = numberOfUndos;
    }

    public override canExecute(): boolean {
        return this.history.getUndo().length >= this.numberOfUndos;
    }

    protected execution(): void {
        for (let i = 0; i < this.numberOfUndos; i++) {
            this.history.undo();
        }
    }
}
