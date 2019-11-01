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

import { CommandImpl } from "../CommandImpl";

/**
 * Initialises the command with the value to set.
 * @param {*} value The value to set.
 * @class
 * @extends CommandImpl
 * @author Arnaud Blouin
 */
export abstract class ModifyValue<T> extends CommandImpl {
    /**
     * The new value of the property.
     */
    protected value: T | undefined;

    protected constructor(value?: T) {
        super();
        this.value = value;
    }

    /**
     *
     */
    public flush(): void {
        super.flush();
        this.value = undefined;
    }

    /**
     *
     * @return {boolean}
     */
    public canDo(): boolean {
        return this.value !== undefined && this.isValueMatchesProperty();
    }

    /**
     * Sets the new value of the parameter to change.
     * @param {*} newValue The new value.
     */
    public setValue(newValue: T): void {
        this.value = newValue;
    }

    /**
     * This method executes the job of methods undo, redo, and do
     * @param {*} obj The value to set. Must not be null.
     * @throws NullPointerException If the given value is null.
     */
    public abstract applyValue(obj: T): void;

    /**
     * @return {boolean} True: the object to modified supports the selected property.
     */
    public abstract isValueMatchesProperty(): boolean;
}
