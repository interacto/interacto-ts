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

import {LinearHistory} from "../../api/history/LinearHistory";
import {Subject} from "rxjs";
import type {Undoable} from "../../api/history/Undoable";
import type {Observable} from "rxjs";
import {hasSelectiveValue} from "../../api/command/Selective";

/**
 * Implementation of the linear history
 * @category History
 */
export class LinearHistoryImpl extends LinearHistory {
    /**
     * Contains the undoable objects.
     */
    private readonly undos: Array<Undoable>;

    /**
     * Contains the redoable objects.
     */
    private readonly redos: Array<Undoable>;

    public readonly considersEqualCmds: boolean;

    /**
     * The maximal number of undoable objects.
     * -1 (or any negative value) corresponds to an unlimited size.
     * 0 corresponds to a history that stores nothing.
     */
    private sizeMax: number;

    private readonly undoPublisher: Subject<Undoable | undefined>;

    private readonly redoPublisher: Subject<Undoable | undefined>;

    private readonly sizePublisher: Subject<[number, number]>;

    /**
     * Create the linear history
     * @param considerEqualCmd - By default, executing a command erases the redoable commands.
     * When executing a command (and adding this command in the history), this option adds a new check:
     * if the newly executed command equals the next redoable one, then the redoable stack is not clear
     * but the history moves to the next redoable command (i.e., perform a redo instead of really adding the command).
     */
    public constructor(considerEqualCmd = false) {
        super();
        this.sizeMax = -1;
        this.undos = [];
        this.redos = [];
        this.undoPublisher = new Subject();
        this.redoPublisher = new Subject();
        this.sizePublisher = new Subject();
        this.considersEqualCmds = considerEqualCmd;
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
        this.publishSize();
    }

    private clearRedo(): void {
        if (this.redos.length > 0) {
            this.redos.length = 0;
            this.redoPublisher.next(undefined);
        }
    }

    public add(undoable: Undoable): void {
        if (this.sizeMax !== 0) {
            if (this.undos.length === this.sizeMax) {
                this.undos.shift();
            }

            const lastRedo = this.redos.at(-1);
            if (this.considersEqualCmds && lastRedo !== undefined && lastRedo.equals(undoable)) {
                this.redo();
            } else {
                this.undos.push(undoable);
                this.undoPublisher.next(undoable);
                this.clearRedo();
                this.publishSize();
            }
        }
    }

    public undo(): void {
        const undoable = this.undos.pop();

        if (undoable !== undefined) {
            try {
                undoable.undo();
            } finally {
                this.redos.push(undoable);
                this.undoPublisher.next(this.getLastUndo());
                this.redoPublisher.next(undoable);
                this.publishSize();
            }
        }
    }

    public redo(): void {
        const undoable = this.redos.pop();

        if (undoable !== undefined) {
            try {
                undoable.redo();
            } finally {
                this.undos.push(undoable);
                this.undoPublisher.next(undoable);
                this.redoPublisher.next(this.getLastRedo());
                this.publishSize();
            }
        }
    }

    public getLastUndoMessage(): string | undefined {
        return this.undos.at(-1)?.getUndoName();
    }

    public getLastRedoMessage(): string | undefined {
        return this.redos.at(-1)?.getUndoName();
    }

    public getLastOrEmptyUndoMessage(): string {
        return this.getLastUndoMessage() ?? "";
    }

    public getLastOrEmptyRedoMessage(): string {
        return this.getLastRedoMessage() ?? "";
    }

    public getLastUndo(): Undoable | undefined {
        return this.undos.at(-1);
    }

    public getLastRedo(): Undoable | undefined {
        return this.redos.at(-1);
    }

    public getSizeMax(): number {
        return this.sizeMax;
    }

    public setSizeMax(max: number): void {
        if (max >= 0) {
            const removed = this.undos.splice(0, this.undos.length - max);
            const willRemoved = removed.length > 0 || this.redos.length > 0;
            if (removed.length > 0 && this.undos.length === 0) {
                this.undoPublisher.next(undefined);
            }
            this.clearRedo();
            if (willRemoved) {
                this.publishSize();
            }
        }
        this.sizeMax = max;
    }

    public getUndo(): ReadonlyArray<Undoable> {
        return this.undos;
    }

    public getRedo(): ReadonlyArray<Undoable> {
        return this.redos;
    }

    public override size(): [number, number] {
        return [this.undos.length, this.redos.length];
    }

    public override sizeObservable(): Observable<[number, number]> {
        return this.sizePublisher;
    }

    private publishSize(): void {
        this.sizePublisher.next(this.size());
    }

    public getSelectiveOf<T extends object | string | number>
    (obj: T, eqFn?: (v1: T, v2: T) => boolean): [Array<Undoable>, Array<Undoable>] {
        const fn = (undoable: Undoable): boolean => hasSelectiveValue(undoable, obj, eqFn);
        return [
            this.undos.filter(undoable => fn(undoable)),
            this.redos.filter(undoable => fn(undoable))
        ];
    }
}
