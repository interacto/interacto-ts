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

import type {UndoableTreeNode, UndoableTreeNodeDTO, TreeUndoHistoryDTO} from "../../api/undo/TreeUndoHistory";
import {TreeUndoHistory} from "../../api/undo/TreeUndoHistory";
import type {Undoable, UndoableSnapshot} from "../../api/undo/Undoable";
import {remove} from "../util/ArrayUtil";
import type {Observable} from "rxjs";
import {Subject} from "rxjs";

/**
 * Implementation of UndoableTreeNode
 */
class UndoableTreeNodeImpl implements UndoableTreeNode {
    public lastChildUndone: UndoableTreeNode | undefined;

    public readonly children: Array<UndoableTreeNode>;

    public readonly id: number;

    public readonly parent: UndoableTreeNode | undefined;

    public readonly undoable: Undoable;

    private readonly cacheVisualSnap: UndoableSnapshot;

    public constructor(undoable: Undoable, id: number, parent: UndoableTreeNode | undefined) {
        this.undoable = undoable;
        this.id = id;
        this.children = new Array<UndoableTreeNode>();
        this.parent = parent;
        this.cacheVisualSnap = undoable.getVisualSnapshot();
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

    public get visualSnapshot(): UndoableSnapshot {
        return this.cacheVisualSnap;
    }
}

class UndoableTreeNodeDTOImpl implements UndoableTreeNodeDTO {
    public readonly children: ReadonlyArray<UndoableTreeNodeDTO>;

    public readonly id: number;

    public readonly undoable: unknown;

    public constructor(node: UndoableTreeNode, fn: (undoable: Undoable) => unknown) {
        this.id = node.id;
        this.undoable = fn(node.undoable);
        this.children = node.children.map(child => new UndoableTreeNodeDTOImpl(child, fn));
    }

    /**
     * Produces a tree node from the DTO node. This operates recurcively on
     * children, so that it converts all the tree node.
     * @param fn - The convertion method for the undoable.
     * @param parent - The parent node of the one to create.
     * @returns The created tree node (and its children) and the list of created nodes.
     */
    public static toNode(dto: UndoableTreeNodeDTO, fn: (dtoUndoable: unknown) => Undoable, parent: UndoableTreeNode):
    [UndoableTreeNode, Array<UndoableTreeNode>] {
        const node = new UndoableTreeNodeImpl(fn(dto.undoable), dto.id, parent);
        const res = dto.children.map(child => UndoableTreeNodeDTOImpl.toNode(child, fn, node));

        node.children.push(...res.map(r => r[0]));
        const nodes = [node, ...res.flatMap(r => r[1])];

        return [node, nodes];
    }
}

/**
 * An implementation of the TreeUndoHistory interface
 */
export class TreeUndoHistoryImpl extends TreeUndoHistory {
    private idCounter: number;

    private _currentNode: UndoableTreeNode;

    public readonly undoableNodes: Array<UndoableTreeNode | undefined>;

    private readonly undoPublisher: Subject<Undoable | undefined>;

    private readonly redoPublisher: Subject<Undoable | undefined>;

    public readonly root: UndoableTreeNode;

    private readonly _path: Array<number>;

    private readonly _keepPath: boolean;

    public constructor(keepPath = false) {
        super();
        this._keepPath = keepPath;
        this._path = [];
        this.undoableNodes = [];
        this.idCounter = 0;
        this.root = new UndoableTreeNodeImpl({
            getUndoName(): string {
                return "";
            },
            getVisualSnapshot(): UndoableSnapshot {
                return "root";
            },
            redo(): void {},
            undo(): void {}
        }, -1, undefined);
        this._currentNode = this.root;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
    }

    public add(undoable: Undoable): void {
        const node = new UndoableTreeNodeImpl(undoable, this.idCounter, this.currentNode);
        this.undoableNodes[this.idCounter] = node;
        this.currentNode.children.push(node);
        this._currentNode = node;
        this.addToPath();
        this.idCounter++;
        this.undoPublisher.next(undoable);
        this.redoPublisher.next(undefined);
    }

    public get currentNode(): UndoableTreeNode {
        return this._currentNode;
    }

    public clear(): void {
        this.root.children.length = 0;
        this._currentNode = this.root;
        this._path.length = 0;
        this.undoableNodes.length = 0;
        this.idCounter = 0;
        this.undoPublisher.next(undefined);
        this.redoPublisher.next(undefined);
    }

    public delete(id: number): void {
        // Cannot delete if keeping path
        if (this.keepPath) {
            return;
        }

        const node = this.undoableNodes[id];

        if (node === undefined) {
            return;
        }

        let nodeBranch = this.currentNode;

        while (nodeBranch !== this.root) {
            // cannot remove the current branch (older or current undoables)
            if (nodeBranch.id === id) {
                return;
            }
            nodeBranch = nodeBranch.parent ?? this.root;
        }

        this.undoableNodes[id] = undefined;

        if (node.parent !== undefined) {
            remove(node.parent.children, node);
            if (node.parent.lastChildUndone === node) {
                node.parent.lastChildUndone = undefined;
            }
        }

        // Cloning the array since 'delete' may alter the children list.
        // eslint-disable-next-line unicorn/no-useless-spread
        for (const child of Array.from(node.children)) {
            this.delete(child.id);
        }

        if (this.currentNode === node) {
            this._currentNode = this.root;
        }
    }

    public goTo(id: number): void {
        if (this.currentNode.id === id || this.undoableNodes.length === 0 || id >= this.undoableNodes.length || id < -1) {
            return;
        }

        if (this.currentNode === this.root) {
            this.goToFromRoot(id);
        } else {
            this.goFromOneNodeToAnotherOne(id);
        }

        this._currentNode = this.undoableNodes[id] ?? this.root;
        this.addToPath();
        this.undoPublisher.next(this.getLastUndo());
        this.redoPublisher.next(this.getLastRedo());
    }

    private goToFromRoot(id: number): void {
        const undoables = this.gatherToRoot(this.undoableNodes[id]);
        for (let i = undoables.length - 1; i >= 0; i--) {
            undoables[i]?.redo();
        }
    }

    private gatherToRoot(node: UndoableTreeNode | undefined): Array<UndoableTreeNode> {
        const path = new Array<UndoableTreeNode>();
        let n = node;
        while (n !== this.root && n !== undefined) {
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
            pathSrc[j]?.undo();
        }
        if (i < pathSrc.length) {
            pathSrc[i]?.undo();
        }
        // to then redo the target path to the targeted node
        for (let j = i; j < pathTo.length; j++) {
            pathTo[j]?.redo();
        }
    }

    public redo(): void {
        const node = this.currentNode.lastChildUndone;

        if (node !== undefined) {
            node.undoable.redo();
            this._currentNode = node;
            this.addToPath();
            this.undoPublisher.next(node.undoable);
            this.redoPublisher.next(this.getLastRedo());
        }
    }

    public undo(): void {
        if (this.currentNode !== this.root) {
            const u = this.currentNode.undoable;
            this.currentNode.undo();
            this._currentNode = this.currentNode.parent ?? this.root;
            this.addToPath();
            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(u);
        }
    }

    public getPositions(): Map<number, number> {
        const positions = new Map<number, number>();
        this.getPositionNode(this.root, positions, 0);
        return positions;
    }

    private getPositionNode(node: UndoableTreeNode, positions: Map<number, number>, counter: number): number {
        const [child0, child1] = node.children;

        // length === 0
        if (child0 === undefined) {
            positions.set(node.id, counter);
            return counter + 1;
        }

        // length === 1
        if (child1 === undefined) {
            const newCounter = this.getPositionNode(child0, positions, counter);
            positions.set(node.id, positions.get(child0.id) ?? -1);
            return newCounter;
        }

        let newCounter = counter;
        for (let i = 0; i < Math.floor(node.children.length / 2); i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            newCounter = this.getPositionNode(node.children[i]!, positions, newCounter);
        }

        if (node.children.length % 2 === 0) {
            positions.set(node.id, newCounter);
            newCounter++;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const value = node.children[Math.floor(node.children.length / 2)]!;
            newCounter = this.getPositionNode(value, positions, newCounter);
            positions.set(node.id, positions.get(value.id) ?? -1);
        }

        for (let i = Math.ceil(node.children.length / 2); i < node.children.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            newCounter = this.getPositionNode(node.children[i]!, positions, newCounter);
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
        if (this.currentNode.lastChildUndone !== undefined) {
            return this.currentNode.lastChildUndone.undoable;
        }

        return this.currentNode.children[0]?.undoable;
    }

    public getLastRedoMessage(): string | undefined {
        return this.getLastRedo()?.getUndoName();
    }

    public getLastUndo(): Undoable | undefined {
        return this.currentNode === this.root ? undefined : this.currentNode.undoable;
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

    public get path(): ReadonlyArray<number> {
        return this._path;
    }

    public get keepPath(): boolean {
        return this._keepPath;
    }

    private addToPath(): void {
        if (this.keepPath) {
            this._path.push(this._currentNode.id);
        }
    }

    public override export(fn: (undoable: Undoable) => unknown): TreeUndoHistoryDTO {
        return {
            "roots": this.root.children.map(child => new UndoableTreeNodeDTOImpl(child, fn)),
            "path": this.path
        };
    }

    public override import(dtoHistory: TreeUndoHistoryDTO, fn: (dtoUndoable: unknown) => Undoable): void {
        this.clear();

        if (this.keepPath) {
            this._path.push(...dtoHistory.path);
        }

        const res = dtoHistory.roots.map(root => UndoableTreeNodeDTOImpl.toNode(root, fn, this.root));
        this.root.children.push(...res.map(r => r[0]));

        for (const n of res.flatMap(r => r[1])) {
            this.undoableNodes[n.id] = n;
        }

        this._currentNode = this.root;
        this.idCounter = Math.max(...this._path) + 1;
        const gotoId = this.path.at(-1);

        // Executing the nominal path
        if (gotoId !== undefined) {
            this.goTo(gotoId);
            this.goTo(-1);
        }

        this.undoPublisher.next(this.getLastUndo());
        this.redoPublisher.next(this.getLastRedo());
    }
}
