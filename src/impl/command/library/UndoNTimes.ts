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

import {CommandBase} from "../CommandBase";
import type {LinearHistory} from "../../../api/history/LinearHistory";

/**
 * An Undo command that undoes the last N commands.
 * @category Command
 */
export class UndoNTimes extends CommandBase {
    protected readonly history: LinearHistory;

    protected readonly numberOfUndos: number;

    public constructor(history: LinearHistory, numberOfUndos: number) {
        super();
        this.history = history;
        this.numberOfUndos = numberOfUndos;
    }

    public override canExecute(): boolean {
        return this.history.getUndo().length >= this.numberOfUndos;
    }

    protected execution(): Promise<void> | void {
        let chain = Promise.resolve();
        for (let i = 0; i < this.numberOfUndos; i++) {
            const res = this.history.undo();
            if (res instanceof Promise) {
                // eslint-disable-next-line  @typescript-eslint/promise-function-async
                chain = chain.then(() => res);
            }
        }
        return chain;
    }
}
