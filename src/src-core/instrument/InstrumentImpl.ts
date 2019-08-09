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

import {WidgetBinding} from "../binding/WidgetBinding";
import {Instrument} from "./Instrument";
import {ErrorCatcher} from "../error/ErrorCatcher";
import {Undoable} from "../undo/Undoable";
import {MArray} from "../../util/ArrayUtil";
import {Command} from "../command/Command";

/**
 * Creates and initialises the instrument.
 * @class
 * @author Arnaud BLOUIN
 */
export abstract class InstrumentImpl<T extends WidgetBinding> implements Instrument<T> {
    /**
     * Defines whether the instrument is activated.
     */
    protected activated: boolean;

    /**
     * The widget bindings of the instrument.
     */
    protected readonly bindings: MArray<T>;

    /**
     * Defined whether the instrument has been modified.
     */
    protected modified: boolean;

    protected constructor() {
        this.activated = false;
        this.modified = false;
        this.bindings = new MArray();
    }

    /**
     *
     * @return {number}
     */
    public getNbWidgetBindings(): number {
        return this.bindings.length;
    }

    /**
     *
     * @return {boolean}
     */
    public hasWidgetBindings(): boolean {
        return this.getNbWidgetBindings() > 0;
    }

    /**
     *
     * @return {*[]}
     */
    public getWidgetBindings(): MArray<T> {
        return this.bindings;
    }

    /**
     * Initialises the bindings of the instrument.
     * @throws InstantiationException When a widget binding cannot instantiate its interaction.
     * @throws IllegalAccessException When a widget binding cannot instantiate its interaction.
     */
    public abstract configureBindings(): void;

    /**
     * Adds the given widget binding to the list of bindings of the instrument.
     * @param {*} binding The widget binding to add. If null, nothing is done.
     */
    public addBinding(binding: T): void {
        if (binding !== undefined) {
            this.bindings.push(binding);
            binding.setActivated(this.isActivated());
        }
    }

    /**
     * Removes the given widget binding from the list of bindings of the instrument.
     * @param {*} binding The widget binding to remove.
     * @return {boolean} True: the given widget binding has been removed. False otherwise.
     */
    public removeBinding(binding: T): boolean {
        return binding !== undefined && this.bindings.remove(binding);
    }

    /**
     *
     */
    public clearEvents(): void {
        this.bindings.forEach(binding => binding.clearEvents());
    }

    /**
     *
     * @return {boolean}
     */
    public isActivated(): boolean {
        return this.activated;
    }

    /**
     *
     * @param {boolean} toBeActivated
     */
    public setActivated(toBeActivated: boolean): void {
        this.activated = toBeActivated;
        if (toBeActivated && !this.hasWidgetBindings()) {
            try {
                this.configureBindings();
            } catch (ex) {
                if (ex instanceof Error) {
                    ErrorCatcher.INSTANCE.reportError(ex);
                }
            }
        } else {
            this.bindings.forEach(binding => binding.setActivated(toBeActivated));
        }
        this.interimFeedback();
    }

    public interimFeedback(): void {
    }

    // /**
    //  * @param {boolean} generalPreferences
    //  * @param {string} nsURI
    //  * @param {*} document
    //  * @param {*} root
    //  */
    // public save(generalPreferences : boolean, nsURI : string, document : org.w3c.dom.Document, root : org.w3c.dom.Element) {
    // }
    //
    // /**
    //  * @param {boolean} generalPreferences
    //  * @param {string} nsURI
    //  * @param {*} meta
    //  */
    // public load(generalPreferences : boolean, nsURI : string, meta : org.w3c.dom.Element) {
    // }

    /**
     *
     * @return {boolean}
     */
    public isModified(): boolean {
        return this.modified;
    }

    /**
     *
     * @param {boolean} isModified
     */
    public setModified(isModified: boolean): void {
        this.modified = isModified;
    }

    public reinit(): void {
    }

    public onUndoableCleared(): void {
    }

    /**
     * @param {*} undoable
     */
    public onUndoableAdded(undoable: Undoable): void {
    }

    /**
     * @param {*} undoable
     */
    public onUndoableUndo(undoable: Undoable): void {
    }

    /**
     * @param {*} undoable
     */
    public onUndoableRedo(undoable: Undoable): void {
    }

    /**
     * @param {*} cmd
     */
    public onCmdAdded(cmd: Command): void {
    }

    /**
     * @param {*} cmd
     */
    public onCmdCancelled(cmd: Command): void {
    }

    /**
     * @param {*} cmd
     */
    public onCmdExecuted(cmd: Command): void {
    }

    /**
     * @param {*} cmd
     */
    public onCmdDone(cmd: Command): void {
    }
}
