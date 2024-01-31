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

import type {Undoable} from "./Undoable";
import type {Observable} from "rxjs";

/**
 * The base interface for undo histories.
 * @category API History
 */
export interface UndoHistoryBase {
    /**
     * Undoes the last undoable object.
     */
    undo(): void;

    /**
     * Redoes the last undoable object.
     */
    redo(): void;

    /**
     * Removes all the undoable objects of the collector.
     */
    clear(): void;

    /**
     * Adds an undoable object to the collector.
     * @param undoable - The undoable object to add.
     */
    add(undoable: Undoable): void;

    /**
     * @returns The last undoable object or undefined if there is no last object.
     */
    getLastUndo(): Undoable | undefined;

    /**
     * @returns The last redoable object or undefined if there is no last object.
     */
    getLastRedo(): Undoable | undefined;

    /**
     * @returns The last undoable object name or undefined if there is no last object.
     */
    getLastUndoMessage(): string | undefined;

    /**
     * @returns The last redoable object name or undefined if there is no last object.
     */
    getLastRedoMessage(): string | undefined;

    /**
     * @returns The last undoable object name or an empty string if there is no last object.
     */
    getLastOrEmptyUndoMessage(): string;

    /**
     * @returns The last redoable object name or an empty string if there is no last object.
     */
    getLastOrEmptyRedoMessage(): string;

    /**
     * A stream for observing changes regarding the last undoable object.
     * @returns An observable value of optional undoable objects: if empty, this means
     * that no undoable object are stored anymore.
     */
    undosObservable(): Observable<Undoable | undefined>;

    /**
     * A stream for observing changes regarding the last redoable object.
     * @returns An observable value of optional redoable objects: if empty, this means
     * that no redoable object are stored anymore.
     */
    redosObservable(): Observable<Undoable | undefined>;
}
