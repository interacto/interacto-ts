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
 * An undoable command that transfers an element from one array to another.
 * @category Command
 */
export class TransferArrayItem<T> extends UndoableCommand {
    /**
     * The array to take the transferred element from.
     */
    protected _srcArray: Array<T>;

    /**
     * The array to put the transferred element in.
     */
    protected _tgtArray: Array<T>;

    /**
     * The index at which the element is located in the source array.
     */
    protected _srcIndex: number;

    /**
     * The index at which the element must be put in the target array.
     */
    protected _tgtIndex: number;

    /**
     * The name of the command.
     */
    protected readonly cmdName: string;

    /**
     * Creates the command.
     * @param srcArray - The array to take the transferred element from.
     * @param tgtArray - The array to put the transferred element in.
     * @param srcIndex - The index at which the element is located in the source array.
     * @param tgtIndex - The index at which the element must be put in the destination array.
     * @param cmdName - The name of the command.
     */
    public constructor(srcArray: Array<T>,
                       tgtArray: Array<T>,
                       srcIndex: number,
                       tgtIndex: number,
                       cmdName: string) {
        super();
        this._srcArray = srcArray;
        this._tgtArray = tgtArray;
        this._srcIndex = srcIndex;
        this._tgtIndex = tgtIndex;
        this.cmdName = cmdName;
    }

    protected execution(): void {
        this.redo();
    }

    public override canExecute(): boolean {
        return (this._srcIndex >= 0 && this._srcIndex < this._srcArray.length) &&
          (this._tgtIndex >= 0 && this._tgtIndex <= this._tgtArray.length);
    }

    public override getUndoName(): string {
        return this.cmdName;
    }

    public redo(): void {
        const elt = this._srcArray[this._srcIndex];
        if (elt !== undefined) {
            this._srcArray.splice(this._srcIndex, 1);
            this._tgtArray.splice(this._tgtIndex, 0, elt);
        }
    }

    public undo(): void {
        const elt = this._tgtArray[this._tgtIndex];
        if (elt !== undefined) {
            this._tgtArray.splice(this._tgtIndex, 1);
            this._srcArray.splice(this._srcIndex, 0, elt);
        }
    }

    public get srcArray(): Array<T> {
        return this._srcArray;
    }

    public set srcArray(value: Array<T>) {
        this._srcArray = value;
    }

    public get tgtArray(): Array<T> {
        return this._tgtArray;
    }

    public set tgtArray(value: Array<T>) {
        this._tgtArray = value;
    }

    public get srcIndex(): number {
        return this._srcIndex;
    }

    public set srcIndex(value: number) {
        this._srcIndex = value;
    }

    public get tgtIndex(): number {
        return this._tgtIndex;
    }

    public set tgtIndex(value: number) {
        this._tgtIndex = value;
    }
}
