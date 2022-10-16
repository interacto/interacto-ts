/* eslint-disable unicorn/empty-brace-spaces */
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

test("command Status After Creation", () => {
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.created);
});

test("command Status After Flush", () => {
    cmd.flush();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("command Cannot Do It When Flushed", () => {
    cmd.flush();
    expect(cmd.execute()).toBeFalsy();
});

test("command Cannot Do It When Done", () => {
    cmd.done();
    expect(cmd.execute()).toBeFalsy();
});

test("command Cannot Do It When Cancelled", () => {
    cmd.cancel();
    expect(cmd.execute()).toBeFalsy();
});

test("command Cannot Do It When Cannot Do And Created", () => {
    cmd.candoValue = false;
    expect(cmd.execute()).toBeFalsy();
});

test("command Can Do It When Can Do", () => {
    expect(cmd.execute()).toBeTruthy();
});

test("command Is Executed When Do It", async () => {
    await cmd.execute();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.executed);
});

test("command Had Effect When Done", () => {
    cmd.done();
    expect(cmd.hadEffect()).toBeTruthy();
});

test("command HadEffect When Not Done And Created", () => {
    expect(cmd.hadEffect()).toBeFalsy();
});

test("command HadEffect When Not Done And Cancelled", () => {
    cmd.cancel();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("command HadEffect When Not Done And Flushed", () => {
    cmd.flush();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("command HadEffect When Not Done And Executed", async () => {
    cmd.candoValue = true;
    await cmd.execute();
    expect(cmd.hadEffect()).toBeFalsy();
});

test("command Not Done When Flushed", () => {
    cmd.flush();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.flushed);
});

test("command Not Done When Cancelled", () => {
    cmd.cancel();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.cancelled);
});

test("command Done When Created", () => {
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
});

test("command Done When Executed", async () => {
    await cmd.execute();
    cmd.done();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
});

test("isDone When Created", () => {
    expect(cmd.isDone()).toBeFalsy();
});

test("isDone When Cancelled", () => {
    cmd.cancel();
    expect(cmd.isDone()).toBeFalsy();
});

test("isDone When Flushed", () => {
    cmd.flush();
    expect(cmd.isDone()).toBeFalsy();
});

test("isDone When Done", () => {
    cmd.done();
    expect(cmd.isDone()).toBeTruthy();
});

test("is Done When Executed", async () => {
    await cmd.execute();
    expect(cmd.isDone()).toBeFalsy();
});

test("not Cancel At Start", () => {
    expect(cmd.getStatus()).not.toStrictEqual(CmdStatus.cancelled);
});

test("cancel", () => {
    cmd.cancel();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.cancelled);
});

test("executed Two Times", async () => {
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
