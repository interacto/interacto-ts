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

import type {Undoable} from "../../api/undo/Undoable";
import type {Observable} from "rxjs";
import {Subject} from "rxjs";
import {peek} from "../util/ArrayUtil";
import type {UndoHistory} from "../../api/undo/UndoHistory";

export class UndoHistoryImpl implements UndoHistory {
    /**
     * The default undo/redo collector.
     */
    private static instance: UndoHistory = new UndoHistoryImpl();

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
        this.sizeMax = 20;
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
    }

    public undosObservable(): Observable<Undoable | undefined> {
        return this.undoPublisher;
    }

    public redosObservable(): Observable<Undoable | undefined> {
        return this.redoPublisher;
    }

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

    public undo(): void {
        const undoable = this.undos.pop();

        if (undoable !== undefined) {
            undoable.undo();
            this.redos.push(undoable);
            this.undoPublisher.next(this.getLastUndo());
            this.redoPublisher.next(undoable);
        }
    }

    public redo(): void {
        const undoable = this.redos.pop();

        if (undoable !== undefined) {
            undoable.redo();
            this.undos.push(undoable);
            this.undoPublisher.next(undoable);
            this.redoPublisher.next(this.getLastRedo());
        }
    }

    public getLastUndoMessage(): string | undefined {
        return peek(this.undos)?.getUndoName();
    }

    public getLastRedoMessage(): string | undefined {
        return peek(this.redos)?.getUndoName();
    }

    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    public getLastUndo(): Undoable | undefined {
        return peek(this.undos);
    }

    public getLastRedo(): Undoable | undefined {
        return peek(this.redos);
    }

    public getSizeMax(): number {
        return this.sizeMax;
    }

    public setSizeMax(max: number): void {
        if (max >= 0) {
            const removed = this.undos.splice(0, this.undos.length - max);
            if (this.undos.length === 0 && removed.length > 0) {
                this.undoPublisher.next(undefined);
            }
            this.sizeMax = max;
        }
    }

    public getUndo(): ReadonlyArray<Undoable> {
        return this.undos;
    }

    public getRedo(): ReadonlyArray<Undoable> {
        return this.redos;
    }
}
