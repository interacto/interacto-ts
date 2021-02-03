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

import {Command, CmdStatus, RegistrationPolicy} from "../../src/api/command/Command";
import {CommandsRegistry} from "../../src/impl/command/CommandsRegistry";
import {UndoHistory} from "../../src/impl/undo/UndoHistory";
import {StubCmd} from "./StubCmd";
import {mock} from "jest-mock-extended";
import {Undoable} from "../../src/api/undo/Undoable";

let instance: CommandsRegistry;

beforeEach(() => {
    instance = new CommandsRegistry();
    instance.setSizeMax(30);
    UndoHistory.getInstance().clear();
});

test("testGetSetSizeMaxOK", () => {
    instance.setSizeMax(55);
    expect(instance.getSizeMax()).toStrictEqual(55);
});

test("testGetSetSizeMaxNeg", () => {
    instance.setSizeMax(45);
    instance.setSizeMax(-1);
    expect(instance.getSizeMax()).toStrictEqual(45);
});

test("testGetSetSizeMaxZero", () => {
    instance.setSizeMax(0);
    expect(instance.getSizeMax()).toStrictEqual(0);
});

test("testSetSizeMaxRemovesCmd", () => {
    const command1 = new StubCmd();
    const command2 = new StubCmd();
    instance.setSizeMax(10);
    instance.addCommand(command1);
    instance.addCommand(command2);
    instance.setSizeMax(1);

    expect(command1.getStatus()).toStrictEqual(CmdStatus.flushed);
    expect(command2.getStatus()).toStrictEqual(CmdStatus.created);
    expect(instance.getCommands()).toHaveLength(1);
    expect(instance.getCommands()[0]).toBe(command2);
});


test("testSetSiezMaxWithUnlimited", () => {
    jest.mock("./StubCmd");
    const cmd1 = mock<Command>();
    cmd1.getRegistrationPolicy.mockReturnValue(RegistrationPolicy.unlimited);
    const cmd2 = mock<Command>();
    cmd2.getRegistrationPolicy.mockReturnValue(RegistrationPolicy.limited);
    const cmd3 = mock<Command>();
    cmd3.getRegistrationPolicy.mockReturnValue(RegistrationPolicy.limited);
    instance.addCommand(cmd2);
    instance.addCommand(cmd1);
    instance.addCommand(cmd3);
    instance.setSizeMax(0);
    expect(instance.getCommands()).toStrictEqual([cmd1]);
});

test("testCommandsNotNull", () => {
    expect(instance.commands()).not.toBeNull();
});

test("testCommandsObservedOnAdded", () => {
    const cmds: Array<Command> = [];
    instance.commands().subscribe(e => cmds.push(e));
    jest.mock("./StubCmd");
    const cmd = mock<Command>();
    instance.addCommand(cmd);
    expect(cmds).toStrictEqual([cmd]);
});

test("testCancelCommandFlush", () => {
    const command = new StubCmd();
    instance.cancelCmd(command);
    expect(command.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("testCancelCommandRemoved", () => {
    const command = mock<Command>();
    instance.addCommand(command);
    instance.cancelCmd(command);
    expect(instance.getCommands()).toHaveLength(0);
});

test("testRemoveCommand", () => {
    const command = new StubCmd();
    instance.addCommand(command);
    instance.removeCommand(command);
    expect(instance.getCommands()).toHaveLength(0);
    expect(command.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("add Command Cannot Add Because Exist", () => {
    const command = mock<Command>();
    instance.addCommand(command);
    instance.addCommand(command);
    expect(instance.getCommands()).toHaveLength(1);
});

test("add Command Removes Command When Max Capacity", () => {
    const command = mock<Command>();
    const command2 = new StubCmd();
    instance.setSizeMax(1);
    instance.addCommand(command2);
    instance.addCommand(command);
    expect(instance.getCommands()).toHaveLength(1);
    expect(instance.getCommands()[0]).toBe(command);
    expect(command2.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("testAddCommandRemovesCommandWhenMaxCapacity0", () => {
    instance.setSizeMax(0);
    instance.addCommand(mock<Command>());
    expect(instance.getCommands()).toHaveLength(0);
});

test("testAddCommandAddsUndoableCollector", () => {
    const command = mock<Command & Undoable>();
    instance.addCommand(command);
    expect(UndoHistory.getInstance().getLastUndo()).toBe(command);
});


test("testClear", () => {
    const c1 = mock<Command>();
    const c2 = mock<Command>();
    jest.spyOn(c1, "flush");
    jest.spyOn(c2, "flush");
    instance.addCommand(c1);
    instance.addCommand(c2);
    instance.clear();
    expect(instance.getCommands()).toHaveLength(0);
    expect(c1.flush).toHaveBeenCalledTimes(1);
    expect(c2.flush).toHaveBeenCalledTimes(1);
});
