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
import type {UndoHistoryBase} from "../../../api/undo/UndoHistoryBase";

/**
 * A Redo action.
 * @category Command
 */
export class Redo extends CommandBase {
    protected readonly history: UndoHistoryBase;

    public constructor(undoHistory: UndoHistoryBase) {
        super();
        this.history = undoHistory;
    }

    public override canExecute(): boolean {
        return this.history.getLastRedo() !== undefined;
    }

    protected execution(): void {
        this.history.redo();
    }
}
