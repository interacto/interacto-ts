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
import {SetProperty} from "./SetProperty";


/**
 * An undoable command that changes the value of a set of object properties.
 * @typeParam T - The type of the object to change
 */
export class SetProperties<T> extends UndoableCommand {
    public readonly obj: T;

    public readonly newvalues: Partial<T>;

    public readonly compositeCmds: Array<SetProperty<T, keyof T>>;

    public constructor(obj: T, newvalues: Partial<T>) {
        super();
        this.obj = obj;
        this.newvalues = newvalues;
        this.compositeCmds = [];

        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const key in newvalues) {
            this.compositeCmds.push(new SetProperty<T, keyof T>(obj, key, newvalues[key] as T[keyof T]));
        }
    }


    public execute(): Promise<boolean> | boolean {
        this.compositeCmds.forEach(cmd => {
            // eslint-disable-next-line no-void
            void cmd.execute();
        });
        return super.execute();
    }

    protected execution(): void {
    }

    public redo(): void {
        this.compositeCmds.forEach(cmd => {
            cmd.redo();
        });
    }

    public undo(): void {
        this.compositeCmds.forEach(cmd => {
            cmd.undo();
        });
    }
}
