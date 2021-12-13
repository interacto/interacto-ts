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

import type {UndoableTreeNode} from "../../api/undo/TreeUndoHistory";
import {TreeUndoHistory} from "../../api/undo/TreeUndoHistory";
import type {Undoable} from "../../api/undo/Undoable";
import {remove} from "../util/ArrayUtil";
import type {Observable} from "rxjs";
import {Subject} from "rxjs";

class UndoableTreeNodeImpl implements UndoableTreeNode {
    public lastChildUndone: UndoableTreeNode | undefined;

    public readonly branchVisualSnapshot: SVGElement | string | undefined;

    public readonly children: Array<UndoableTreeNode>;

    public readonly id: number;

    public readonly parent: UndoableTreeNode | undefined;

    public readonly undoable: Undoable;

    public readonly visualSnapshot: SVGElement | string | undefined;

    public constructor(undoable: Undoable, id: number, parent: UndoableTreeNode | undefined) {
        this.undoable = undoable;
        this.id = id;
        this.children = new Array<UndoableTreeNode>();
        this.parent = parent;
    }

    public undo(): void {
        if (this.parent !== undefined) {
            this.parent.lastChildUndone = this;
        }
        this.undoable.undo();
    }

    public redo(): void {
        this.undoable.redo();
    }
}

export class TreeUndoHistoryImpl extends TreeUndoHistory {
    private idCounter: number;

    private _currentNode: UndoableTreeNode | undefined;

    public readonly undoableNodes: Array<UndoableTreeNode | undefined>;

    private readonly undoPublisher: Subject<Undoable | undefined>;

    private readonly redoPublisher: Subject<Undoable | undefined>;

    public constructor() {
        super();
        this.undoableNodes = new Array<UndoableTreeNode>();
        this.idCounter = 0;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
    }

    public add(undoable: Undoable): void {
        const node = new UndoableTreeNodeImpl(undoable, this.idCounter, this.currentNode);
        this.undoableNodes[this.idCounter] = node;
        if (this.currentNode !== undefined) {
            this.currentNode.children.push(node);
        }
        this._currentNode = node;
        this.idCounter++;
        this.undoPublisher.next(undoable);
    }

    public get currentNode(): UndoableTreeNode | undefined {
        return this._currentNode;
    }

    public clear(): void {
        this._currentNode = undefined;
        this.undoableNodes.length = 0;
        this.idCounter = 0;
        this.undoPublisher.next(undefined);
        this.redoPublisher.next(undefined);
    }

    public delete(id: number): void {
        const node = this.undoableNodes[id];

        if (node === undefined) {
            return;
        }
        this.undoableNodes[id] = undefined;

        if (node.parent !== undefined) {
            remove(node.parent.children, node);
            if (node.parent.lastChildUndone === node) {
                node.parent.lastChildUndone = undefined;
            }
        }

        // Cloning the array since 'delete' may alter the children list.
        [...node.children].forEach(child => {
            this.delete(child.id);
        });

        if (this.currentNode === node) {
            this._currentNode = undefined;
        }
    }

    public goTo(id: number): void {
        if (this.currentNode?.id === id || this.undoableNodes.length === 0 || id >= this.undoableNodes.length || id < -1) {
            return;
        }

        if (this.currentNode === undefined) {
            this.goToFromRoot(id);
        } else {
            this.goFromOneNodeToAnotherOne(id);
        }

        this._currentNode = this.undoableNodes[id];
    }

    private goToFromRoot(id: number): void {
        const undoables = this.gatherToRoot(this.undoableNodes[id]);
        for (let i = undoables.length - 1; i >= 0; i--) {
            undoables[i].redo();
        }
    }

    private gatherToRoot(node: UndoableTreeNode | undefined): Array<UndoableTreeNode> {
        const path = new Array<UndoableTreeNode>();
        let n = node;
        while (n !== undefined) {
            path.push(n);
            n = n.parent;
        }
        return path.reverse();
    }

    private goFromOneNodeToAnotherOne(id: number): void {
        // Go to root
        const pathSrc = this.gatherToRoot(this.currentNode);
        const pathTo = id === -1 ? [] : this.gatherToRoot(this.undoableNodes[id]);

        // Following the common path
        let i = 0;
        while (pathSrc[i] === pathTo[i]) {
            i++;
        }

        // When taking different paths,
        // we undo from the source path to the common node,
        for (let j = pathSrc.length - 1; j > i; j--) {
            pathSrc[j].undo();
        }
        pathSrc[i].undo();
        // to then redo the target path to the targeted node
        for (let j = i; j < pathTo.length; j++) {
            pathTo[j].redo();
        }
    }

    public redo(): void {
        const node = this.currentNode === undefined ? this.undoableNodes[0] : this.currentNode.lastChildUndone;

        if (node !== undefined) {
            node.undoable.redo();
            this._currentNode = node;
            this.undoPublisher.next(node.undoable);
            this.redoPublisher.next(this.getLastRedo());
        }
    }

    public undo(): void {
        if (this.currentNode !== undefined) {
            const u = this.currentNode.undoable;
            this.currentNode.undo();
            this._currentNode = this.currentNode.parent;
            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(u);
        }
    }

    public getPositions(): Map<number, number> {
        const positions = new Map<number, number>();
        if (this.undoableNodes[0] !== undefined) {
            this.getPositionNode(this.undoableNodes[0], positions, 0);
        }
        return positions;
    }

    private getPositionNode(node: UndoableTreeNode, positions: Map<number, number>, counter: number): number {
        if (node.children.length === 0) {
            positions.set(node.id, counter);
            return counter + 1;
        }
        if (node.children.length === 1) {
            const newCounter = this.getPositionNode(node.children[0], positions, counter);
            positions.set(node.id, positions.get(node.children[0].id) ?? -1);
            return newCounter;
        }

        let newCounter = counter;
        for (let i = 0; i < Math.floor(node.children.length / 2); i++) {
            newCounter = this.getPositionNode(node.children[i], positions, newCounter);
        }

        if (node.children.length % 2 === 0) {
            positions.set(node.id, newCounter);
            newCounter++;
        } else {
            newCounter = this.getPositionNode(node.children[Math.floor(node.children.length / 2)], positions, newCounter);
            positions.set(node.id, positions.get(node.children[Math.floor(node.children.length / 2)].id) ?? -1);
        }

        for (let i = Math.ceil(node.children.length / 2); i < node.children.length; i++) {
            newCounter = this.getPositionNode(node.children[i], positions, newCounter);
        }

        return newCounter;
    }

    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    public getLastRedo(): Undoable | undefined {
        if (this.currentNode === undefined) {
            return this.undoableNodes[0]?.undoable;
        }

        if (this.currentNode.lastChildUndone !== undefined) {
            return this.currentNode.lastChildUndone.undoable;
        }

        return this.currentNode.children[0]?.undoable;
    }

    public getLastRedoMessage(): string | undefined {
        return this.getLastRedo()?.getUndoName();
    }

    public getLastUndo(): Undoable | undefined {
        return this.currentNode?.undoable;
    }

    public getLastUndoMessage(): string | undefined {
        return this.getLastUndo()?.getUndoName();
    }

    public undosObservable(): Observable<Undoable | undefined> {
        return this.undoPublisher;
    }

    public redosObservable(): Observable<Undoable | undefined> {
        return this.redoPublisher;
    }
}
