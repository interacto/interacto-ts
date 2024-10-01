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
 * The basic accepted types for producing snapshots of undoable commands
 * @category API History
 */
export type PrimitiveUndoableSnapshot = HTMLElement | SVGElement | string;

/**
 * The type of the visual snpashot that an undoable command can produce
 * @category API History
 */
export type UndoableSnapshot = PrimitiveUndoableSnapshot | Promise<PrimitiveUndoableSnapshot> | undefined;

/**
 * An interface for undoable objects.
 * @category API History
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
    getVisualSnapshot(): UndoableSnapshot;

    /**
     * States whether the two commands are equals.
     * By default, if `cmd` is the same object that `this`,
     * the method returns true. Developers can override this
     * method to defined their own implementation to be used,
     * for example, in a command history to merge equivalent commands.
     * @param undoable - The command to compare with 'this'.
     */
    equals(undoable: Undoable): boolean;
}

/**
 * Tests whether the given object is an Undoable.
 * @param obj - The object to test.
 * @returns True: the object is an Undoable
 * @category Helper
 */
export function isUndoableType(obj: unknown): obj is Undoable {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    return "undo" in obj && "redo" in obj && "getUndoName" in obj;
}

