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
 * The error to use when the command being processsed should be undoable.
 * @category Helper
 */
export class MustBeUndoableCmdError extends Error {
    public constructor(cmdProducer: unknown) {
        super(`The following command must be undoable: ${String(cmdProducer)}`);
        this.name = "MustBeUndoableCmdError";
    }
}

