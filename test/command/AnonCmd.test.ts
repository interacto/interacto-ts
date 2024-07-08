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
import { describe, expect, jest, test } from "@jest/globals";

describe("using an anon command", () => {
    let cmd: AnonCmd;

    test("can Do OK Cmd", () => {
        cmd = new AnonCmd(() => {});
        expect(cmd.canExecute()).toBeTruthy();
    });

    test("execute", async () => {
        const fn = jest.fn();
        cmd = new AnonCmd(fn);
        await cmd.execute();
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test("hadEffect", async () => {
        cmd = new AnonCmd(() => {});
        await cmd.execute();
        cmd.done();
        expect(cmd.hadEffect()).toBeTruthy();
    });
});
