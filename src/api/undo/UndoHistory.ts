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
import type {UndoHistoryBase} from "./UndoHistoryBase";

/**
 * A history of undone/redone objects.
 * Why a pure abstract class and not an interface?
 * Because interfaces are not retained at runtime in TS and we want DI (that thus cannot inject interface types).
 */
export abstract class UndoHistory implements UndoHistoryBase {
    abstract add(undoable: Undoable): void;

    abstract clear(): void;

    abstract undo(): void;

    abstract redo(): void;

    /**
     * @returns The stack of saved undoable objects.
     */
    abstract getUndo(): ReadonlyArray<Undoable>;

    /**
     * @returns The stack of saved redoable objects
     */
    abstract getRedo(): ReadonlyArray<Undoable>;

    /**
     * A stream for observing changes regarding the last undoable object.
     * @returns An observable value of optional undoable objects: if empty, this means
     * that no undoable object are stored anymore.
     */
    abstract undosObservable(): Observable<Undoable | undefined>;

    /**
     * A stream for observing changes regarding the last redoable object.
     * @returns An observable value of optional redoable objects: if empty, this means
     * that no redoable object are stored anymore.
     */
    abstract redosObservable(): Observable<Undoable | undefined>;

    abstract getLastUndo(): Undoable | undefined;

    abstract getLastRedo(): Undoable | undefined;

    abstract getLastUndoMessage(): string | undefined;

    abstract getLastRedoMessage(): string | undefined;

    abstract getLastOrEmptyUndoMessage(): string;

    abstract getLastOrEmptyRedoMessage(): string;

    /**
     * @returns The max number of saved undoable objects.
     */
    abstract getSizeMax(): number;

    /**
     * @param max - The max number of saved undoable objects. Must be great than 0.
     */
    abstract setSizeMax(max: number): void;
}
