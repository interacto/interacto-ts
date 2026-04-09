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

import {CommandBase, Modifiable, UndoableCommand} from "../../src/interacto";
import type {Undoable} from "../../src/interacto";

export class ExampleUndoableCmd extends UndoableCommand {
    protected execution(): Promise<void> | void {
        return undefined;
    }

    public redo(): void {}

    public undo(): void {}
}

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

export class CmdModifiableDouble2 extends StubCmd {
    @Modifiable
    public a = 0;
}

export class CmdModifiableDouble3 extends ExampleUndoableCmd {
    @Modifiable
    public a = {};

    @Modifiable
    public b: Array<string> = [];

    @Modifiable
    public c: number | undefined = undefined;
}

export class CmdModifiableDouble extends ExampleUndoableCmd {
    @Modifiable
    public a: number;

    @Modifiable
    public b: boolean;

    public c: string;

    public re: number;

    public constructor() {
        super();
        this.a = 0;
        this.b = false;
        this.c = "foo";
        this.re = 0;
    }

    public override redo(): void {
        this.re++;
    }
}
