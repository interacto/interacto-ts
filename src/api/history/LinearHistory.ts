/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import type {Undoable} from "./Undoable";
import type {LinearHistoryBase} from "./LinearHistoryBase";
import type {Observable} from "rxjs";

/**
 * A linear command history.
 * Why a pure abstract class and not an interface?
 * Because interfaces are not retained at runtime in TS and we want DI (that thus cannot inject interface types).
 * @category API History
 */
export abstract class LinearHistory implements LinearHistoryBase {
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
     * @param max - The maximal number of undoable objects to store.
     *  -1 (or any negative value) corresponds to an unlimited size.
     * 0 corresponds to a history that stores nothing.
     */
    public abstract setSizeMax(max: number): void;

    public abstract get considersEqualCmds(): boolean;

    /**
     * The number of elements the history contains.
     * Provide both the size of the history and the redo stacks in the produced tuple.
     */
    public abstract size(): [undos: number, redos: number];

    /**
     * An RX object to observe the number of elements in the history.
     */
    public abstract sizeObservable(): Observable<[undos: number, redos: number]>;
}
