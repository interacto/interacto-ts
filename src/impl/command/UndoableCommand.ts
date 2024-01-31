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

import {CommandBase} from "./CommandBase";
import type {Undoable, UndoableSnapshot} from "../../api/undo/Undoable";

/**
 * The base class for undoable UI commands.
 * @category Command
 */
export abstract class UndoableCommand extends CommandBase implements Undoable {
    public getUndoName(): string {
        return this.constructor.name;
    }

    public getVisualSnapshot(): UndoableSnapshot {
        return undefined;
    }

    public abstract redo(): void;

    public abstract undo(): void;
}
