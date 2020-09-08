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

import {Undoable} from "./Undoable";
import {Subject, Observable} from "rxjs";
import {peek} from "../util/ArrayUtil";

/**
 * A collector of undone/redone objects.
 * @author Arnaud BLOUIN
 */
export class UndoCollector {
    /**
     * The default undo/redo collector.
     */
    private static instance: UndoCollector = new UndoCollector();

    public static setInstance(newInstance: UndoCollector): void {
        this.instance = newInstance;
    }

    public static getInstance(): UndoCollector {
        return this.instance;
    }

    /**
     * The standard text for redo.
     */
    public static readonly EMPTY_REDO: string = "redo";

    /**
     * The standard text for undo.
     */
    public static readonly EMPTY_UNDO: string = "undo";

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
     * @return An observable value of optional undoable objects: if empty, this means
     * that no undoable object are stored anymore.
     */
    public undosObservable(): Observable<Undoable | undefined> {
        return this.undoPublisher;
    }

    /**
     * A stream for observing changes regarding the last redoable object.
     * @return An observable value of optional redoable objects: if empty, this means
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
     * @param {*} undoable The undoable object to add.
     * @param {*} undoHandler The handler that produced or is associated to the undoable object.
     */
    public add(undoable: Undoable): void {
        if (this.sizeMax > 0) {
            if (this.undos.length === this.sizeMax) {
                this.undos.pop();
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
     * @return The last undoable object name or undefined if there is no last object.
     */
    public getLastUndoMessage(): string | undefined {
        return peek(this.undos)?.getUndoName();
    }

    /**
     * @return The last redoable object name or undefined if there is no last object.
     */
    public getLastRedoMessage(): string | undefined {
        return peek(this.redos)?.getUndoName();
    }

    /**
     * @return The last undoable object name or an empty string if there is no last object.
     */
    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    /**
     * @return The last redoable object name or an empty string if there is no last object.
     */
    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    /**
     * @return The last undoable object or undefined if there is no last object.
     */
    public getLastUndo(): Undoable | undefined {
        return peek(this.undos);
    }

    /**
     * @return The last redoable object or undefined if there is no last object.
     */
    public getLastRedo(): Undoable | undefined {
        return peek(this.redos);
    }

    /**
     * @return {number} The max number of saved undoable objects.
     */
    public getSizeMax(): number {
        return this.sizeMax;
    }

    /**
     * @param {number} max The max number of saved undoable objects. Must be great than 0.
     */
    public setSizeMax(max: number): void {
        if (max >= 0) {
            let removed = false;
            for (let i = 0, nb = this.undos.length - max; i < nb; i++) {
                this.undos.pop();
                removed = true;
            }
            if (removed && this.undos.length === 0) {
                this.undoPublisher.next(undefined);
            }
            this.sizeMax = max;
        }
    }

    /**
     * @return {*[]} The stack of saved undoable objects.
     */
    public getUndo(): Array<Undoable> {
        return this.undos;
    }

    /**
     * @return {*[]} The stack of saved redoable objects
     */
    public getRedo(): Array<Undoable> {
        return this.redos;
    }
}
