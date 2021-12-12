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

    readonly visualSnapshot: SVGElement | string | undefined;

    readonly branchVisualSnapshot: SVGElement | string | undefined;

    undo(): void;

    redo(): void;
}

export interface TreeUndoHistory extends UndoHistoryBase {
    readonly undoableNodes: Array<UndoableTreeNode | undefined>;

    readonly currentNode: UndoableTreeNode | undefined;

    goTo(id: number): void;

    delete(id: number): void;
}
