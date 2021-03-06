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
 */
export interface Undoable {
    /**
     * Cancels the command.
     */
    undo(): void;

    /**
     * Redoes the cancelled command.
     */
    redo(): void;

    /**
     * @returns The name of the undo command.
     */
    getUndoName(): string;

    /**
     * Gives some information about the impact of a command.
     * @returns Information about the impact of the commmand as an SVG element or text.
     */
    getVisualSnapshot(): SVGElement | string | undefined;
}

export function isUndoableType(obj: unknown): obj is Undoable {
    const undoable = obj as Undoable;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return undoable.undo !== undefined && undoable.redo !== undefined && undoable.getUndoName !== undefined;
}

