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

import {UndoableCommand} from "../UndoableCommand";

/**
 * An undoable command that changes the value of an object property.
 * @typeParam T - The type of the object to change
 * @typeParam S - The property of T to set
 * @category Command
 */
export class SetProperty<T, S extends keyof T> extends UndoableCommand {
    protected readonly obj: T;

    protected readonly prop: S;

    public newvalue: T[S];

    protected mementoValue: T[S] | undefined;

    public constructor(obj: T, prop: S, newvalue: T[S]) {
        super();
        this.obj = obj;
        this.prop = prop;
        this.newvalue = newvalue;
        this.mementoValue = undefined;
    }

    protected override createMemento(): void {
        this.mementoValue = this.obj[this.prop];
    }

    protected execution(): void {
        this.obj[this.prop] = this.newvalue;
    }

    public redo(): void {
        this.execution();
    }

    public undo(): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.obj[this.prop] = this.mementoValue!;
    }

    public override getUndoName(): string {
        return `Set '${String(this.prop)}' value: ${String(this.newvalue)}`;
    }
}
