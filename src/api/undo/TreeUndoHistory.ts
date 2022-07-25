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

import type {UndoHistoryBase} from "./UndoHistoryBase";
import type {Undoable} from "./Undoable";
import type {UndoableSnapshot} from "./Undoable";
import type {Observable} from "rxjs";

/**
 * Tree undo history.
 * On adding undoables after an undo operation, the redoable objects are no more flush but
 * kept in the history as a granch of the graph.
 * Useful for exploration.
 */
export interface UndoableTreeNode {
    lastChildUndone: UndoableTreeNode | undefined;

    readonly id: number;

    readonly undoable: Undoable;

    readonly parent: UndoableTreeNode | undefined;

    readonly children: Array<UndoableTreeNode>;

    readonly visualSnapshot: UndoableSnapshot;

    undo(): void;

    redo(): void;
}

export abstract class TreeUndoHistory implements UndoHistoryBase {
    public abstract get root(): UndoableTreeNode;

    public abstract get undoableNodes(): Array<UndoableTreeNode | undefined>;

    public abstract get currentNode(): UndoableTreeNode;

    public abstract goTo(id: number): void;

    public abstract delete(id: number): void;

    /**
     * Computes the position (in the large) of each node.
     * Useful for layouting.
     */
    public abstract getPositions(): Map<number, number>;

    public abstract add(undoable: Undoable): void;

    public abstract clear(): void;

    public abstract getLastOrEmptyRedoMessage(): string;

    public abstract getLastOrEmptyUndoMessage(): string;

    public abstract getLastRedo(): Undoable | undefined;

    public abstract getLastRedoMessage(): string | undefined;

    public abstract getLastUndo(): Undoable | undefined;

    public abstract getLastUndoMessage(): string | undefined;

    public abstract redo(): void;

    public abstract redosObservable(): Observable<Undoable | undefined>;

    public abstract undo(): void;

    public abstract undosObservable(): Observable<Undoable | undefined>;
}
