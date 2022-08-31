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
 * The interface for nodes in a tree-based history.
 */
export interface UndoableTreeNode {
    /**
     * Among the children of the node, iidentifies the one that was undone recently.
     */
    lastChildUndone: UndoableTreeNode | undefined;

    /**
     * The unique ID of the node among the tree.
     */
    readonly id: number;

    /**
     * The undoable object contained in the node.
     */
    readonly undoable: Undoable;

    /**
     * The possible parent node.
     */
    readonly parent: UndoableTreeNode | undefined;

    /**
     * The children of the node.
     */
    readonly children: Array<UndoableTreeNode>;

    /**
     * The visual snapshot of the node. Used to render the tree history.
     */
    readonly visualSnapshot: UndoableSnapshot;

    /**
     * Undoes the undoable object of this node.
     */
    undo(): void;

    /**
     * Redoes the undoable object of this node.
     */
    redo(): void;
}


/**
 * The DTO interface used when exporting a tree-based history.
 */
export interface UndoableTreeNodeDTO {
    /**
     * The unique ID of the node among the tree.
     */
    readonly id: number;

    /**
     * The undoable object contained in the node, in an unkown format as
     * the format is defined by the developer while exporting the history.
     */
    readonly undoable: unknown;

    /**
     * The children of the node, in their DTO format.
     */
    readonly children: ReadonlyArray<UndoableTreeNodeDTO>;
}


/**
 * The DTO for tree nodes used while exporting a tree-based history.
 */
export interface TreeUndoHistoryDTO {
    readonly path: ReadonlyArray<number>;

    readonly roots: ReadonlyArray<UndoableTreeNodeDTO>;
}


/**
 * Tree-based undo history.
 * On adding undoables after an undo operation, the redoable objects are no more flush but
 * kept in the history as a granch of the graph.
 * Useful for exploration.
 */
export abstract class TreeUndoHistory implements UndoHistoryBase {
    /**
     * States whether the path of kept. If kept, users cannot delete
     * nodes.
     */
    public abstract get keepPath(): boolean;

    /**
     * Returns the ordered sequence of undoable's ID that the user performed.
     * This permits to keep traces of what the users did and how they arrived
     * to the final state.
     */
    public abstract get path(): ReadonlyArray<number>;

    /**
     * The root node of the history. It is a fake node (it does not refer
     * to any undoable object).
     */
    public abstract get root(): UndoableTreeNode;

    /**
     * All the nodes of the tree.
     */
    public abstract get undoableNodes(): Array<UndoableTreeNode | undefined>;

    /**
     * The current node. As the history is a tree in which one can navigate using
     * undo, redo, gotTo, this current node refers to the node
     * where the system state is.
     */
    public abstract get currentNode(): UndoableTreeNode;

    /**
     * Moves to the given node ID.
     * @param id - The node ID contained in the tree. Moves to it if correct.
     */
    public abstract goTo(id: number): void;

    /**
     * Deletes the targeted node. Works only if the history does not keep the
     * usage path (see path()).
     * @param id - The node ID to remove. It removes all the branch from this node.
     * Does not remove the branch if the current node is in it.
     */
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

    /**
     * Exports the history.
     * @param fn - The function that converts undoable objects into ad-hoc formats.
     */
    public abstract export(fn: (undoable: Undoable) => unknown): TreeUndoHistoryDTO;

    /**
     * Imports the given DTO history. Flushes the current history.
     * @param dtoHistory - The DTO history to import.
     * @param fn - The convertion fonction that transforms undoable DTO (of nodes) into Undoable.
     */
    public abstract import<T>(dtoHistory: TreeUndoHistoryDTO, fn: (dtoUndoable: T) => Undoable): void;
}
