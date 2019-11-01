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
import { CommandsRegistry, UndoCollector, CmdStatus, CommandImpl, Command } from "../../src";
import { StubCmd, StubUndoableCmd } from "./StubCmd";


class StubCmd2 extends CommandImpl {
    public constructor() {
        super();
    }

    public unregisteredBy(cmd: Command): boolean {
        return cmd instanceof StubCmd;
    }

    protected doCmdBody(): void {
    }
}

beforeEach(() => {
    CommandsRegistry.INSTANCE.clear();
    CommandsRegistry.INSTANCE.setSizeMax(30);
    UndoCollector.INSTANCE.clear();
});

test("testGetSetSizeMaxOK", () => {
    CommandsRegistry.INSTANCE.setSizeMax(55);
    expect(CommandsRegistry.INSTANCE.getSizeMax()).toEqual(55);
});

test("testGetSetSizeMaxNeg", () => {
    CommandsRegistry.INSTANCE.setSizeMax(45);
    CommandsRegistry.INSTANCE.setSizeMax(-1);
    expect(CommandsRegistry.INSTANCE.getSizeMax()).toEqual(45);
});

test("testGetSetSizeMaxZero", () => {
    CommandsRegistry.INSTANCE.setSizeMax(0);
    expect(CommandsRegistry.INSTANCE.getSizeMax()).toEqual(0);
});

test("testSetSizeMaxRemovesCmd", () => {
    const command1 = new StubCmd();
    const command2 = new StubCmd();
    CommandsRegistry.INSTANCE.setSizeMax(10);
    CommandsRegistry.INSTANCE.addCommand(command1);
    CommandsRegistry.INSTANCE.addCommand(command2);
    CommandsRegistry.INSTANCE.setSizeMax(1);

    expect(command1.getStatus()).toEqual(CmdStatus.FLUSHED);
    expect(command2.getStatus()).toEqual(CmdStatus.CREATED);
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(1);
    expect(CommandsRegistry.INSTANCE.getCommands()[0]).toBe(command2);
});

test("testCancelCommandFlush", () => {
    const command = new StubCmd();
    CommandsRegistry.INSTANCE.cancelCmd(command);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testCancelCommandRemoved", () => {
    const command = new StubCmd();
    CommandsRegistry.INSTANCE.addCommand(command);
    CommandsRegistry.INSTANCE.cancelCmd(command);
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(0);
});

test("testRemoveCommand", () => {
    const command = new StubCmd();
    CommandsRegistry.INSTANCE.addCommand(command);
    CommandsRegistry.INSTANCE.removeCmd(command);
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(0);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("test Unregister Cmd KO", () => {
    const command = new StubCmd();
    CommandsRegistry.INSTANCE.addCommand(command);
    CommandsRegistry.INSTANCE.unregisterCmd(new StubCmd2());
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(1);
    expect(command.getStatus()).not.toEqual(CmdStatus.FLUSHED);
});

test("test Unregister Cmd OK", () => {
    const command = new StubCmd2();
    CommandsRegistry.INSTANCE.addCommand(command);
    CommandsRegistry.INSTANCE.unregisterCmd(new StubCmd());
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(0);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testAddCommandCannotAddBecauseExist", () => {
    const command = new StubCmd();
    CommandsRegistry.INSTANCE.getCommands().push(command);
    CommandsRegistry.INSTANCE.addCommand(command);
    expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(1);
});

test("testAddCommandRemovesCommandWhenMaxCapacity", () => {
	const command = new StubCmd();
	const command2 = new StubCmd();
	CommandsRegistry.INSTANCE.setSizeMax(1);
	CommandsRegistry.INSTANCE.getCommands().push(command2);
	CommandsRegistry.INSTANCE.addCommand(command);
	expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(1);
	expect(CommandsRegistry.INSTANCE.getCommands()[0]).toBe(command);
	expect(command2.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testAddCommandRemovesCommandWhenMaxCapacity", () => {
	CommandsRegistry.INSTANCE.setSizeMax(0);
	CommandsRegistry.INSTANCE.addCommand(new StubCmd());
	expect(CommandsRegistry.INSTANCE.getCommands().length).toEqual(0);
});

test("testAddCommandAddsUndoableCollector", () => {
	const command = new StubUndoableCmd();
	CommandsRegistry.INSTANCE.addCommand(command);
	expect(UndoCollector.INSTANCE.getLastUndo().get()).toBe(command);
});
