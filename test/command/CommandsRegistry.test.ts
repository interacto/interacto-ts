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

let instance : CommandsRegistry;

beforeEach(() => {
    instance = new CommandsRegistry();
    instance.setSizeMax(30);
    UndoCollector.getInstance().clear();
});

test("testGetSetSizeMaxOK", () => {
    instance.setSizeMax(55);
    expect(instance.getSizeMax()).toEqual(55);
});

test("testGetSetSizeMaxNeg", () => {
    instance.setSizeMax(45);
    instance.setSizeMax(-1);
    expect(instance.getSizeMax()).toEqual(45);
});

test("testGetSetSizeMaxZero", () => {
    instance.setSizeMax(0);
    expect(instance.getSizeMax()).toEqual(0);
});

test("testSetSizeMaxRemovesCmd", () => {
    const command1 = new StubCmd();
    const command2 = new StubCmd();
    instance.setSizeMax(10);
    instance.addCommand(command1);
    instance.addCommand(command2);
    instance.setSizeMax(1);

    expect(command1.getStatus()).toEqual(CmdStatus.FLUSHED);
    expect(command2.getStatus()).toEqual(CmdStatus.CREATED);
    expect(instance.getCommands().length).toEqual(1);
    expect(instance.getCommands()[0]).toBe(command2);
});

test("testCancelCommandFlush", () => {
    const command = new StubCmd();
    instance.cancelCmd(command);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testCancelCommandRemoved", () => {
    const command = new StubCmd();
    instance.addCommand(command);
    instance.cancelCmd(command);
    expect(instance.getCommands().length).toEqual(0);
});

test("testRemoveCommand", () => {
    const command = new StubCmd();
    instance.addCommand(command);
    instance.removeCmd(command);
    expect(instance.getCommands().length).toEqual(0);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("test Unregister Cmd KO", () => {
    const command = new StubCmd();
    instance.addCommand(command);
    instance.unregisterCmd(new StubCmd2());
    expect(instance.getCommands().length).toEqual(1);
    expect(command.getStatus()).not.toEqual(CmdStatus.FLUSHED);
});

test("test Unregister Cmd OK", () => {
    const command = new StubCmd2();
    instance.addCommand(command);
    instance.unregisterCmd(new StubCmd());
    expect(instance.getCommands().length).toEqual(0);
    expect(command.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testAddCommandCannotAddBecauseExist", () => {
    const command = new StubCmd();
    instance.getCommands().push(command);
    instance.addCommand(command);
    expect(instance.getCommands().length).toEqual(1);
});

test("testAddCommandRemovesCommandWhenMaxCapacity", () => {
	const command = new StubCmd();
	const command2 = new StubCmd();
	instance.setSizeMax(1);
	instance.getCommands().push(command2);
	instance.addCommand(command);
	expect(instance.getCommands().length).toEqual(1);
	expect(instance.getCommands()[0]).toBe(command);
	expect(command2.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testAddCommandRemovesCommandWhenMaxCapacity", () => {
	instance.setSizeMax(0);
	instance.addCommand(new StubCmd());
	expect(instance.getCommands().length).toEqual(0);
});

test("testAddCommandAddsUndoableCollector", () => {
	const command = new StubUndoableCmd();
	instance.addCommand(command);
	expect(UndoCollector.getInstance().getLastUndo().get()).toBe(command);
});
