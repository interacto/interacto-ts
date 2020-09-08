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
import {Command} from "../../src/command/Command";
import {CommandImpl} from "../../src/command/CommandImpl";
import {CommandsRegistry} from "../../src/command/CommandsRegistry";
import {UndoCollector} from "../../src/undo/UndoCollector";
import {StubCmd} from "./StubCmd";


jest.mock("./StubCmd");

let cmd: Command;

afterEach(() => {
    jest.clearAllMocks();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("testExecuteAndFlushCannotDo", () => {
    StubCmd.prototype.canDo = jest.fn().mockImplementation(() => false);
    cmd = new StubCmd();
    CommandImpl.executeAndFlush(cmd);
    expect(cmd.doIt).not.toHaveBeenCalled();
    expect(cmd.flush).toHaveBeenCalledTimes(1);
});

test("testExecuteAndFlushCanDo", () => {
    StubCmd.prototype.canDo = jest.fn().mockImplementation(() => true);
    StubCmd.prototype.doIt = jest.fn().mockImplementation(() => true);
    cmd = new StubCmd();
    CommandImpl.executeAndFlush(cmd);
    expect(cmd.doIt).toHaveBeenCalledTimes(1);
    expect(cmd.flush).toHaveBeenCalledTimes(1);
});
