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

import type {Undoable, UndoableSnapshot} from "./Undoable";
import type {LinearHistoryBase} from "./LinearHistoryBase";
import type {Observable} from "rxjs";

/**
 * The type that defines the concept of a node stored in a tree-based history.
 * @category API History
 */
export interface UndoableTreeNode {
    /**
     * Among the children of the node, identifies the one that was undone recently.
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
 * @category Helper
 */
export interface UndoableTreeNodeDTO {
    /**
     * The unique ID of the node among the tree.
     */
    readonly id: number;

    /**
     * The undoable object contained in the node, in an unknown format as
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
 * @category Helper
 */
export interface TreeUndoHistoryDTO {
    /**
     * The current history path in the tree
     */
    readonly path: ReadonlyArray<number>;

    /**
     * The different roots of the tree.
     */
    readonly roots: ReadonlyArray<UndoableTreeNodeDTO>;
}

/**
 * The type that defines the concept of a tree-based history.
 * On adding undoable objects after a history operation, the redoable objects are no more flush but
 * kept in the history as a branch of the graph.
 * Useful for exploration.
 * @category API History
 */
export abstract class TreeHistory implements LinearHistoryBase {
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
     * history, redo, gotTo, this current node refers to the node
     * where the system state is.
     */
    public abstract get currentNode(): UndoableTreeNode;

    /**
     * Moves to the given node ID.
     * @param id - The node ID contained in the tree. Moves to it if correct.
     */
    public abstract goTo(id: number): void;

    /**
     * Deletes the targeted node and all its descendants.
     * Works only if the history does not keep the usage path (see path()).
     * @param id - The node ID to remove. It removes all the branch starting from this node included.
     * Does nothing if the current node is part of the nodes to be removed.
     */
    public abstract deleteFrom(id: number): void;

    /**
     * Retrieves the modifiable attributes of the undoable node identified by the given id.
     * See the method `getModifiableCmdAttributes` in the class `ModifiableCommand`.
     * @param id - The id of the undoable to retrieve.
     * @returns An object containing the modifiable attributes of the targeted undoable node with their current values.
     * The method returns an empty structured if no node matches the given id.
     */
    public abstract getModifiableAttributesOf(id: number): object;

    /**
     * Applies modified attributes to the command identified by the given `id` within the undoable nodes.
     * Technically, the method clones the targeted undoable node, applies the modifications from `data`, re-executes the command,
     * and then stores the novel cloned undoable node in the history.
     * @param id - The identifier of the undoable node to modify (to clone and then patch).
     * The method does nothing if the id is not valid.
     * @param data - The attribute changes to apply to the command. JSON format.
     * The elements of the JSON object must match with the class attributes (tagged with `@Modifiable`) of the undoable object.
     */
    public abstract applyModifiedAttributesOn(id: number, data: object): void;

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
     * @param fn - The transformation function that transforms undoable DTO (of nodes) into Undoable.
     */
    public abstract import(dtoHistory: TreeUndoHistoryDTO, fn: (dtoUndoable: unknown) => Undoable): void;

    public abstract get considersEqualCmds(): boolean;

    /**
     * The number of elements the history contains in all the branches
     */
    public abstract size(): number;

    /**
     * An RX object to observe the number of elements in the history.
     */
    public abstract sizeObservable(): Observable<number>;
}
