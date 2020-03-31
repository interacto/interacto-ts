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
import { CmdStatus, RegistrationPolicy } from "../../src/command/Command";
import { CommandImpl } from "../../src/command/CommandImpl";
import { CommandsRegistry } from "../../src/command/CommandsRegistry";
import { UndoCollector } from "../../src/undo/UndoCollector";
import { StubCmd } from "./StubCmd";

let cmd: StubCmd;


beforeEach(() => {
    cmd = new StubCmd();
    cmd.candoValue = true;
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("cando default", () => {
    const command = new class extends CommandImpl {
        public constructor() {
            super();
        }

        protected doCmdBody(): void {
        }
    }();

    expect(command.canDo()).toBeTruthy();
});

test("execute and flush cannotDo", () => {
    jest.spyOn(cmd, "doIt");
    jest.spyOn(cmd, "flush");
    cmd.candoValue = false;
    CommandImpl.executeAndFlush(cmd);
    expect(cmd.doIt).not.toHaveBeenCalled();
    expect(cmd.flush).toHaveBeenCalledTimes(1);
});

test("execute and flush canDo", () => {
    jest.spyOn(cmd, "doIt");
    jest.spyOn(cmd, "flush");
    CommandImpl.executeAndFlush(cmd);
    expect(cmd.doIt).toHaveBeenCalledTimes(1);
    expect(cmd.flush).toHaveBeenCalledTimes(1);
});

test("testCommandStatusAfterCreation", () => {
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.CREATED);
});

test("testCommandStatusAfterFlush", () => {
    cmd.flush();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.FLUSHED);
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
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.EXECUTED);
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
    expect(cmd.getRegistrationPolicy()).toStrictEqual(RegistrationPolicy.NONE);
});

test("testGetRegistrationPolicyDone", () => {
    cmd.done();
    expect(cmd.getRegistrationPolicy()).toStrictEqual(RegistrationPolicy.LIMITED);
});

test("testCommandNotDoneWhenFlushed", () => {
    cmd.flush();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.FLUSHED);
});

test("testCommandNotDoneWhenCancelled", () => {
    cmd.cancel();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.CANCELLED);
});

test("testCommandDoneWhenCreated", () => {
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.DONE);
});

test("testCommandDoneWhenExecuted", () => {
    cmd.doIt();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.DONE);
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
    expect(cmd.getStatus()).not.toStrictEqual(CmdStatus.CANCELLED);
});

test("testCancel", () => {
    cmd.cancel();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.CANCELLED);
});

test("testExecutedTwoTimes", () => {
    cmd.doIt();
    cmd.doIt();
    expect(cmd.exec).toStrictEqual(2);
});
