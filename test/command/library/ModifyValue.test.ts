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

import { ModifyValue } from "../../../src/command/library/ModifyValue";

class ModifyValueImpl extends ModifyValue<string> {
    public mustMatch = false;
    public cptApply = 0;

    public constructor() {
        super();
    }

    public applyValue(): void {
        this.cptApply++;
    }

    public isValueMatchesProperty(): boolean {
        return this.mustMatch;
    }
}

let cmd: ModifyValueImpl;

beforeEach(() => {
    cmd = new ModifyValueImpl();
});

test("testCannotDo", () => {
    expect(cmd.canDo()).toBeFalsy();
});

test("testCannotDoMatch", () => {
    cmd.setValue("foo");
    expect(cmd.canDo()).toBeFalsy();
});

test("testSetValue", () => {
    cmd.setValue("bar");
    expect(cmd.getValue()).toStrictEqual("bar");
});

test("testFlush", () => {
    cmd.setValue("yo");
    cmd.flush();
    expect(cmd.getValue()).toBeUndefined();
});

test("testCanDo", () => {
    cmd.mustMatch = true;
    cmd.setValue("foo");
    expect(cmd.canDo()).toBeTruthy();
});

test("testDo", () => {
    cmd.mustMatch = true;
    cmd.setValue("foo");
    cmd.doIt();
    expect(cmd.cptApply).toStrictEqual(1);
});

test("testHadEffects", () => {
    cmd.mustMatch = true;
    cmd.setValue("bar");
    cmd.doIt();
    cmd.done();
    expect(cmd.hadEffect()).toBeTruthy();
});
