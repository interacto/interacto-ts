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


/**
 * A collector of undone/redone objects.
 * @author Arnaud BLOUIN
 * @since 0.1
 * @class
 */
import {UndoHandler} from "./UndoHandler";
import {Undoable} from "./Undoable";
import {Optional} from "../util/Optional";
import {EmptyUndoHandler} from "./EmptyUndoHandler";
import {MArray} from "../util/ArrayUtil";

export class UndoCollector {
    /**
     * The default undo/redo collector.
     */
    public static readonly INSTANCE: UndoCollector = new UndoCollector();

    /**
     * The standard text for redo.
     */
    public static readonly EMPTY_REDO: string = "redo";

    /**
     * The standard text for undo.
     */
    public static readonly EMPTY_UNDO: string = "undo";

    /**
     * The Null object for UndoHandler. To avoid the use of null in the stacks.
     */
    private static readonly STUB_UNDO_HANDLER: UndoHandler = new EmptyUndoHandler();

    /**
     * Contains the handler of each undoable of the undo stack
     */
    private readonly undoHandlers: MArray<UndoHandler>;

    /**
     * Contains the handler of each undoable of the redo stack
     */
    private readonly redoHandlers: MArray<UndoHandler>;

    /**
     * Contains the undoable objects.
     */
    private readonly undos: MArray<Undoable>;

    /**
     * Contains the redoable objects.
     */
    private readonly redos: MArray<Undoable>;

    /**
     * The maximal number of undo.
     */
    private sizeMax: number;

    /**
     * The handler that handles the collector.
     */
    private readonly handlers: MArray<UndoHandler>;

    constructor() {
        this.sizeMax = 0;
        this.handlers = new MArray();
        this.undos = new MArray();
        this.redos = new MArray();
        this.undoHandlers = new MArray();
        this.redoHandlers = new MArray();
        this.sizeMax = 30;
    }

    /**
     * Adds a handler to the collector.
     * @param {*} handler The handler to add. Must not be null.
     */
    public addHandler(handler: UndoHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Removes the given handler from the collector.
     * @param {*} handler The handler to remove. Must not be null.
     */
    public removeHandler(handler: UndoHandler): void {
        this.handlers.remove(handler);
    }

    public getHandlers(): Array<UndoHandler> {
        return [...this.handlers];
    }

    public clearHandlers(): void {
        this.handlers.clear();
    }

    /**
     * Removes all the undoable objects of the collector.
     */
    public clear(): void {
        this.undos.clear();
        this.redos.clear();
        this.undoHandlers.clear();
        this.redoHandlers.clear();
        this.handlers.forEach(handler => handler.onUndoableCleared());
    }

    /**
     * Adds an undoable object to the collector.
     * @param {*} undoable The undoable object to add.
     * @param {*} undoHandler The handler that produced or is associated to the undoable object.
     */
    public add(undoable: Undoable, undoHandler?: UndoHandler): void {
        if (this.sizeMax > 0) {
            if (this.undos.length === this.sizeMax) {
                this.undos.pop();
                this.undoHandlers.pop();
            }

            this.undos.push(undoable);
            // When undo handler is null, a fake object is added instead of using null.
            if (undoHandler === undefined) {
                this.undoHandlers.push(UndoCollector.STUB_UNDO_HANDLER);
            } else {
                this.undoHandlers.push(undoHandler);
            }
            this.redos.length = 0;
            this.redoHandlers.length = 0;

            this.handlers.forEach(handler => handler.onUndoableAdded(undoable));
        }
    }

    /**
     * Undoes the last undoable object.
     */
    public undo(): void {
        const undoable = this.undos.pop();
        const undoHandler = this.undoHandlers.pop();

        if (undoable !== undefined && undoHandler !== undefined) {
            undoable.undo();
            this.redos.push(undoable);
            this.redoHandlers.push(undoHandler);
            undoHandler.onUndoableUndo(undoable);
            this.handlers.forEach(handler => handler.onUndoableUndo(undoable));
        }
    }

    /**
     * Redoes the last undoable object.
     */
    public redo(): void {
        const undoable = this.redos.pop();
        const redoHandler = this.redoHandlers.pop();

        if (undoable !== undefined && redoHandler !== undefined) {
            undoable.redo();
            this.undos.push(undoable);
            this.undoHandlers.push(redoHandler);
            redoHandler.onUndoableRedo(undoable);
            this.handlers.forEach(handler => handler.onUndoableRedo(undoable));
        }
    }

    /**
     * @return {Optional} The last undoable object name or null if there is no last object.
     */
    public getLastUndoMessage(): Optional<string> {
        return this.undos.isEmpty() ? Optional.empty<string>() : Optional.ofNullable<Undoable>(this.undos.peek()).map(o => o.getUndoName());
    }

    /**
     * @return {Optional} The last redoable object name or null if there is no last object.
     */
    public getLastRedoMessage(): Optional<string> {
        return this.redos.isEmpty() ? Optional.empty<string>() : Optional.ofNullable<Undoable>(this.redos.peek()).map(o => o.getUndoName());
    }

    /**
     * @return {Optional} The last undoable object or null if there is no last object.
     */
    public getLastUndo(): Optional<Undoable> {
        return this.undos.isEmpty() ? Optional.empty<Undoable>() : Optional.ofNullable<Undoable>(this.undos.peek());
    }

    /**
     * @return {Optional} The last redoable object or null if there is no last object.
     */
    public getLastRedo(): Optional<Undoable> {
        return this.redos.isEmpty() ? Optional.empty<Undoable>() : Optional.ofNullable<Undoable>(this.redos.peek());
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
            for (let i = 0, nb = this.undos.length - max; i < nb; i++) {
                this.undos.pop();
                this.undoHandlers.pop();
            }
            this.sizeMax = max;
        }
    }

    /**
     * @return {*[]} The stack of saved undoable objects.
     * @since 0.1
     */
    public getUndo(): Array<Undoable> {
        return this.undos;
    }

    /**
     * @return {*[]} The stack of saved redoable objects
     * @since 0.1
     */
    public getRedo(): Array<Undoable> {
        return this.redos;
    }
}
