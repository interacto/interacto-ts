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
import {CmdStatus} from "../../src/api/command/Command";
import {CommandBase} from "../../src/impl/command/CommandBase";
import {StubCmd} from "./StubCmd";

let cmd: StubCmd;


beforeEach(() => {
    cmd = new StubCmd();
    cmd.candoValue = true;
});

test("cando default", () => {
    const command = new class extends CommandBase {
        protected execution(): void {
        }
    }();

    expect(command.canExecute()).toBeTruthy();
});

test("testCommandStatusAfterCreation", () => {
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.created);
});

test("testCommandStatusAfterFlush", () => {
    cmd.flush();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("testCommandCannotDoItWhenFlushed", () => {
    cmd.flush();
    expect(cmd.execute()).toBeFalsy();
});

test("testCommandCannotDoItWhenDone", () => {
    cmd.done();
    expect(cmd.execute()).toBeFalsy();
});

test("testCommandCannotDoItWhenCancelled", () => {
    cmd.cancel();
    expect(cmd.execute()).toBeFalsy();
});

test("testCommandCannotDoItWhenCannotDoAndCreated", () => {
    cmd.candoValue = false;
    expect(cmd.execute()).toBeFalsy();
});

test("testCommandCanDoItWhenCanDo", () => {
    expect(cmd.execute()).toBeTruthy();
});

test("testCommandIsExecutedWhenDoIt", async () => {
    await cmd.execute();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.executed);
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

test("testCommandHadEffectWhenNotDoneAndExecuted", async () => {
    cmd.candoValue = true;
    await cmd.execute();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("testCommandNotDoneWhenFlushed", () => {
    cmd.flush();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("testCommandNotDoneWhenCancelled", () => {
    cmd.cancel();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.cancelled);
});

test("testCommandDoneWhenCreated", () => {
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
});

test("testCommandDoneWhenExecuted", async () => {
    await cmd.execute();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
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

test("testIsDoneWhenExecuted", async () => {
    await cmd.execute();
    expect(cmd.isDone()).toBeFalsy();
});

test("testNotCancelAtStart", () => {
    expect(cmd.getStatus()).not.toStrictEqual(CmdStatus.cancelled);
});

test("testCancel", () => {
    cmd.cancel();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.cancelled);
});

test("testExecutedTwoTimes", async () => {
    await cmd.execute();
    await cmd.execute();
    expect(cmd.exec).toBe(2);
});

test("crash in execution, command executed", () => {
    const command = new class extends CommandBase {
        protected execution(): void {
            throw new Error("Cmd err");
        }
    }();

    expect(() => command.execute()).toThrow(new Error("Cmd err"));
    expect(command.getStatus()).toStrictEqual(CmdStatus.executed);
});
