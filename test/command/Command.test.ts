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
import { CommandsRegistry, UndoCollector, CmdStatus, RegistrationPolicy } from "../../src";
import { StubCmd } from "./StubCmd";

let cmd: StubCmd;


beforeEach(() => {
    cmd = new StubCmd();
    cmd.candoValue = true;
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});


test("testCommandStatusAfterCreation", () => {
    expect(cmd.getStatus()).toEqual(CmdStatus.CREATED);
});

test("testCommandStatusAfterFlush", () => {
    cmd.flush();
    expect(cmd.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testCommandCannotDoItWhenFlushed", () => {
    cmd.flush();
    expect(cmd.doIt()).toBeFalsy();
});

test("testCommandCannotDoItWhenDone", () => {
    cmd.done();
    expect(cmd.doIt()).toBeFalsy();
});

test("testCommandCannotDoItWhenCancelled", () => {
    cmd.cancel();
    expect(cmd.doIt()).toBeFalsy();
});

test("testCommandCannotDoItWhenCannotDoAndCreated", () => {
    cmd.candoValue = false;
    expect(cmd.doIt()).toBeFalsy();
});

test("testCommandCanDoItWhenCanDo", () => {
    expect(cmd.doIt()).toBeTruthy();
});

test("testCommandIsExecutedWhenDoIt", () => {
    cmd.doIt();
    expect(cmd.getStatus()).toEqual(CmdStatus.EXECUTED);
});

test("testCommandHadEffectWhenDone", () => {
    cmd.done();
    expect(cmd.hadEffect()).toBeTruthy();
});

test("testCommandHadEffectWhenNotDoneAndCreated", () => {
    expect(cmd.hadEffect()).toBeFalsy();
});

test("testCommandHadEffectWhenNotDoneAndCancelled", () => {
    cmd.cancel();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("testCommandHadEffectWhenNotDoneAndFlushed", () => {
    cmd.flush();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("testCommandHadEffectWhenNotDoneAndExecuted", () => {
    cmd.candoValue = true;
    cmd.doIt();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("testGetRegistrationPolicyNotExecuted", () => {
	expect(cmd.getRegistrationPolicy()).toEqual(RegistrationPolicy.NONE);
});

test("testGetRegistrationPolicyDone", () => {
	cmd.done();
	expect(cmd.getRegistrationPolicy()).toEqual(RegistrationPolicy.LIMITED);
});

test("testCommandNotUnregisterByByDefault", () => {
    expect(cmd.unregisteredBy(new StubCmd())).toBeFalsy();
});

test("testCommandNotDoneWhenFlushed", () => {
    cmd.flush();
    cmd.done();
    expect(cmd.getStatus()).toEqual(CmdStatus.FLUSHED);
});

test("testCommandNotDoneWhenCancelled", () => {
    cmd.cancel();
    cmd.done();
    expect(cmd.getStatus()).toEqual(CmdStatus.CANCELLED);
});

test("testCommandDoneWhenCreated", () => {
    cmd.done();
    expect(cmd.getStatus()).toEqual(CmdStatus.DONE);
});

test("testCommandDoneWhenExecuted", () => {
    cmd.doIt();
    cmd.done();
    expect(cmd.getStatus()).toEqual(CmdStatus.DONE);
});

test("testIsDoneWhenCreated", () => {
    expect(cmd.isDone()).toBeFalsy();
});

test("testIsDoneWhenCancelled", () => {
    cmd.cancel();
    expect(cmd.isDone()).toBeFalsy();
});

test("testIsDoneWhenFlushed", () => {
    cmd.flush();
    expect(cmd.isDone()).toBeFalsy();
});

test("testIsDoneWhenDone", () => {
    cmd.done();
    expect(cmd.isDone()).toBeTruthy();
});

test("testIsDoneWhenExecuted", () => {
    cmd.doIt();
    expect(cmd.isDone()).toBeFalsy();
});

test("testNotCancelAtStart", () => {
    expect(cmd.getStatus()).not.toEqual(CmdStatus.CANCELLED);
});

test("testCancel", () => {
    cmd.cancel();
    expect(cmd.getStatus()).toEqual(CmdStatus.CANCELLED);
});

test("testExecutedTwoTimes", () => {
    cmd.doIt();
    cmd.doIt();
    expect(cmd.exec).toEqual(2);
});
