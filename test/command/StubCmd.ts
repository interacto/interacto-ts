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

import {CommandBase} from "../../src/interacto";
import type {Undoable} from "../../src/interacto";

export class StubCmd extends CommandBase {
    public candoValue: boolean;

    public effects: boolean | undefined;

    public value: number;

    public constructor(candoValue = false, effects?: boolean) {
        super();
        this.candoValue = candoValue;
        this.effects = effects;
        this.value = 0;
    }

    protected execution(): void {}

    public override canExecute(): boolean {
        return this.candoValue;
    }

    public override hadEffect(): boolean {
        return this.effects ?? super.hadEffect();
    }
}

export class StubUndoableCmd extends StubCmd implements Undoable {
    public getUndoName(): string {
        return "";
    }

    public redo(): void {}

    public undo(): void {}

    public getVisualSnapshot(): SVGElement | string | undefined {
        return undefined;
    }

    public equals(_undoable: Undoable): boolean {
        return false;
    }
}
