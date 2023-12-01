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
import type {UndoHistoryBase} from "./UndoHistoryBase";
import type {Observable} from "rxjs";

/**
 * A history of undone/redone objects.
 * Why a pure abstract class and not an interface?
 * Because interfaces are not retained at runtime in TS and we want DI (that thus cannot inject interface types).
 */
export abstract class UndoHistory implements UndoHistoryBase {
    public abstract add(undoable: Undoable): void;

    public abstract clear(): void;

    public abstract undo(): void;

    public abstract redo(): void;

    /**
     * @returns The stack of saved undoable objects.
     */
    public abstract getUndo(): ReadonlyArray<Undoable>;

    /**
     * @returns The stack of saved redoable objects
     */
    public abstract getRedo(): ReadonlyArray<Undoable>;

    public abstract undosObservable(): Observable<Undoable | undefined>;

    public abstract redosObservable(): Observable<Undoable | undefined>;

    public abstract getLastUndo(): Undoable | undefined;

    public abstract getLastRedo(): Undoable | undefined;

    public abstract getLastUndoMessage(): string | undefined;

    public abstract getLastRedoMessage(): string | undefined;

    public abstract getLastOrEmptyUndoMessage(): string;

    public abstract getLastOrEmptyRedoMessage(): string;

    /**
     * @returns The max number of saved undoable objects.
     */
    public abstract getSizeMax(): number;

    /**
     * @param max - The max number of saved undoable objects. Must be great than 0.
     */
    public abstract setSizeMax(max: number): void;
}
