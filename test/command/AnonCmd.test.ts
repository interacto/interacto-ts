/*
 * Interacto
 * Copyright (C) 2019 Arnaud Blouin
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {AnonCmd} from "../../src/impl/command/AnonCmd";

let cmd: AnonCmd;

test("testCanDoOKCmd", () => {
    cmd = new AnonCmd(() => { });
    expect(cmd.canExecute()).toBeTruthy();
});

test("testExecute", () => {
    let ok = false;
    cmd = new AnonCmd(() => {
        ok = true;
    });
    cmd.execute();
    expect(ok).toBeTruthy();
});

test("testHadEffect", () => {
    cmd = new AnonCmd(() => { });
    cmd.execute();
    cmd.done();
    expect(cmd.hadEffect()).toBeTruthy();
});
