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

import {Undoable} from "../../api/undo/Undoable";
import {Subject, Observable} from "rxjs";
import {peek} from "../util/ArrayUtil";

/**
 * A history of undone/redone objects.
 */
export class UndoHistory {
    /**
     * The default undo/redo collector.
     */
    private static instance: UndoHistory = new UndoHistory();

    public static setInstance(newInstance: UndoHistory): void {
        this.instance = newInstance;
    }

    public static getInstance(): UndoHistory {
        return this.instance;
    }

    /**
     * Contains the undoable objects.
     */
    private readonly undos: Array<Undoable>;

    /**
     * Contains the redoable objects.
     */
    private readonly redos: Array<Undoable>;

    /**
     * The maximal number of undo.
     */
    private sizeMax: number;

    private readonly undoPublisher: Subject<Undoable | undefined>;

    private readonly redoPublisher: Subject<Undoable | undefined>;

    public constructor() {
        this.sizeMax = 0;
        this.undos = [];
        this.redos = [];
        this.sizeMax = 30;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
    }

    /**
     * A stream for observing changes regarding the last undoable object.
     * @returns An observable value of optional undoable objects: if empty, this means
     * that no undoable object are stored anymore.
     */
    public undosObservable(): Observable<Undoable | undefined> {
        return this.undoPublisher;
    }

    /**
     * A stream for observing changes regarding the last redoable object.
     * @returns An observable value of optional redoable objects: if empty, this means
     * that no redoable object are stored anymore.
     */
    public redosObservable(): Observable<Undoable | undefined> {
        return this.redoPublisher;
    }

    /**
     * Removes all the undoable objects of the collector.
     */
    public clear(): void {
        if (this.undos.length > 0) {
            this.undos.length = 0;
            this.undoPublisher.next(undefined);
        }
        this.clearRedo();
    }

    private clearRedo(): void {
        if (this.redos.length > 0) {
            this.redos.length = 0;
            this.redoPublisher.next(undefined);
        }
    }

    /**
     * Adds an undoable object to the collector.
     * @param undoable - The undoable object to add.
     */
    public add(undoable: Undoable): void {
        if (this.sizeMax > 0) {
            if (this.undos.length === this.sizeMax) {
                this.undos.shift();
            }

            this.undos.push(undoable);
            this.undoPublisher.next(undoable);
            this.clearRedo();
        }
    }

    /**
     * Undoes the last undoable object.
     */
    public undo(): void {
        const undoable = this.undos.pop();

        if (undoable !== undefined) {
            undoable.undo();
            this.redos.push(undoable);
            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    /**
     * Redoes the last undoable object.
     */
    public redo(): void {
        const undoable = this.redos.pop();

        if (undoable !== undefined) {
            undoable.redo();
            this.undos.push(undoable);
            this.undoPublisher.next(undoable);
            this.redoPublisher.next(this.getLastRedo());
        }
    }

    /**
     * @returns The last undoable object name or undefined if there is no last object.
     */
    public getLastUndoMessage(): string | undefined {
        return peek(this.undos)?.getUndoName();
    }

    /**
     * @returns The last redoable object name or undefined if there is no last object.
     */
    public getLastRedoMessage(): string | undefined {
        return peek(this.redos)?.getUndoName();
    }

    /**
     * @returns The last undoable object name or an empty string if there is no last object.
     */
    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    /**
     * @returns The last redoable object name or an empty string if there is no last object.
     */
    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    /**
     * @returns The last undoable object or undefined if there is no last object.
     */
    public getLastUndo(): Undoable | undefined {
        return peek(this.undos);
    }

    /**
     * @returns The last redoable object or undefined if there is no last object.
     */
    public getLastRedo(): Undoable | undefined {
        return peek(this.redos);
    }

    /**
     * @returns The max number of saved undoable objects.
     */
    public getSizeMax(): number {
        return this.sizeMax;
    }

    /**
     * @param max - The max number of saved undoable objects. Must be great than 0.
     */
    public setSizeMax(max: number): void {
        if (max >= 0) {
            const removed = this.undos.splice(0, this.undos.length - max);
            if (this.undos.length === 0 && removed.length > 0) {
                this.undoPublisher.next(undefined);
            }
            this.sizeMax = max;
        }
    }

    /**
     * @returns The stack of saved undoable objects.
     */
    public getUndo(): ReadonlyArray<Undoable> {
        return this.undos;
    }

    /**
     * @returns The stack of saved redoable objects
     */
    public getRedo(): ReadonlyArray<Undoable> {
        return this.redos;
    }
}
