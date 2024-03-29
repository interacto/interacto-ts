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

import {SetProperty} from "./SetProperty";
import {UndoableCommand} from "../UndoableCommand";

/**
 * An undoable command that changes the value of a set of object properties.
 * @typeParam T - The type of the object to change
 * @category Command
 */
export class SetProperties<T> extends UndoableCommand {
    public readonly obj: T;

    protected _newvalues: Partial<T>;

    public readonly compositeCmds: Array<SetProperty<T, keyof T>>;

    public constructor(obj: T, newvalues: Partial<T>) {
        super();
        this.obj = obj;

        this.compositeCmds = [];
        this._newvalues = newvalues;
        this.newvalues = newvalues;
    }

    public get newvalues(): Partial<T> {
        return this._newvalues;
    }

    public set newvalues(value: Partial<T>) {
        this._newvalues = value;

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in value) {
            this.compositeCmds.push(new SetProperty<T, keyof T>(this.obj, key, value[key] as T[keyof T]));
        }
    }

    public override execute(): Promise<boolean> | boolean {
        for (const cmd of this.compositeCmds) {
            // eslint-disable-next-line no-void
            void cmd.execute();
        }
        return super.execute();
    }

    protected execution(): void {}

    public redo(): void {
        for (const cmd of this.compositeCmds) {
            cmd.redo();
        }
    }

    public undo(): void {
        for (const cmd of this.compositeCmds) {
            cmd.undo();
        }
    }
}
