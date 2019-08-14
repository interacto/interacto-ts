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

/**
 * An interface for undoable objects.
 * @author Arnaud BLOUIN
 * @since 0.1
 * @class
 */
export interface Undoable {
    /**
     * Cancels the command.
     * @since 0.1
     */
    undo(): void;

    /**
     * Redoes the cancelled command.
     * @since 0.1
     */
    redo(): void;

    /**
     * @return {string} The name of the undo command.
     * @since 0.1
     */
    getUndoName(): string;
}

export function isUndoableType(obj: Undoable | Object): obj is Undoable {
    return (<Undoable>obj).undo !== undefined && (<Undoable>obj).redo !== undefined && (<Undoable>obj).getUndoName !== undefined;
}

