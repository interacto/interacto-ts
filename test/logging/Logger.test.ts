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

import {LoggerImpl} from "../../src/interacto";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";

describe("using a logger", () => {
    let logger: LoggerImpl;

    beforeEach(() => {
        jest.spyOn(performance, "now").mockReturnValueOnce(123);
        logger = new LoggerImpl();
        jest.spyOn(console, "log");
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.spyOn(performance, "now").mockRestore();
        jest.spyOn(console, "log").mockRestore();
    });

    test("init ok", () => {
        expect(logger.serverAddress).toBeUndefined();
        expect(logger.writeConsole).toBeTruthy();
        expect(logger.ongoingBindings).toHaveLength(0);
        expect(logger.sessionID.length).toBeGreaterThan(5);
    });

    test("session id regenerated", () => {
        const log2 = new LoggerImpl();
        expect(logger.sessionID).not.toStrictEqual(log2.sessionID);
    });

    test("log cmd msg in console with no cmd name", () => {
        jest.spyOn(performance, "now").mockRestore();
        jest.spyOn(performance, "now").mockReturnValueOnce(10);
        logger.logCmdMsg("mm");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO [${logger.sessionID}] [command:] at 10: 'mm'`);
    });

    test("log cmd msg in console with a cmd name", () => {
        jest.spyOn(performance, "now").mockRestore();
        jest.spyOn(performance, "now").mockReturnValueOnce(11);
        logger.logCmdMsg("m2", "mycmd");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO [${logger.sessionID}] [command:mycmd] at 11: 'm2'`);
    });

    test("log cmd msg in console with a front-end version", () => {
        logger = new LoggerImpl("1.0.1");
        logger.logCmdMsg("m2");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO 1.0.1 [${logger.sessionID}] [command:] at 123: 'm2'`);
    });

    test("no log cmd msg in console", () => {
        logger.writeConsole = false;
        jest.spyOn(performance, "now").mockReturnValueOnce(11);
        logger.logCmdMsg("m2", "mycmd");
        // eslint-disable-next-line no-console
        expect(console.log).not.toHaveBeenCalled();
    });

    test("log interaction msg in console with no interaction name", () => {
        logger.logInteractionMsg("ii");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO [${logger.sessionID}] [interaction:] at 123: 'ii'`);
    });

    test("log interaction msg in console with interaction name and frontend version", () => {
        logger = new LoggerImpl("1.1");
        logger.logInteractionMsg("ii", "ff");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO 1.1 [${logger.sessionID}] [interaction:ff] at 123: 'ii'`);
    });

    test("log binding msg in console with no name", () => {
        logger.logBindingMsg("b");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO [${logger.sessionID}] [binding:] at 123: 'b'`);
    });

    test("log binding msg in console with name and frontend version", () => {
        logger = new LoggerImpl("1.1");
        logger.logBindingMsg("ee", "aa");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`INFO 1.1 [${logger.sessionID}] [binding:aa] at 123: 'ee'`);
    });

    test("log binding err in console no name with Error", () => {
        const err = new Error("Foo");
        logger.logBindingErr("c", err);
        // eslint-disable-next-line no-console,jest/no-conditional-in-test
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [binding:] at 123: 'c', Foo ${err.stack ?? ""}`);
    });

    test("log binding err in console no name", () => {
        logger.logBindingErr("c", 3);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [binding:] at 123: 'c', 3`);
    });

    test("log cmd err in console no name with Error", () => {
        const err = new Error("AA");
        logger.logCmdErr("c", err);
        // eslint-disable-next-line no-console,jest/no-conditional-in-test
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [command:] at 123: 'c', AA ${err.stack ?? ""}`);
    });

    test("log cmd err in console", () => {
        logger.logCmdErr("c", "yy", "fooo");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [command:fooo] at 123: 'c', yy`);
    });

    test("log interaction err in console no name with Error", () => {
        const err = new Error("AA");
        logger.logInteractionErr("c", err);
        // eslint-disable-next-line no-console,jest/no-conditional-in-test
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [interaction:] at 123: 'c', AA ${err.stack ?? ""}`);
    });

    test("log interaction err in console", () => {
        logger.logInteractionErr("ccc", "xx", "ooo");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(`ERR [${logger.sessionID}] [interaction:ooo] at 123: 'ccc', xx`);
    });

    test("log interaction err REST", () => {
        const xhrMock: Partial<XMLHttpRequest> = {
            "open": jest.fn(),
            "send": jest.fn(),
            "setRequestHeader": jest.fn()
        };

        jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => xhrMock as XMLHttpRequest);

        logger.writeConsole = false;
        logger.serverAddress = "localhost";

        logger.logInteractionErr("c", "err");
        // eslint-disable-next-line no-console
        expect(console.log).not.toHaveBeenCalledWith();
        expect(xhrMock.open).toHaveBeenCalledWith("POST", "localhost/api/err", true);
        expect(xhrMock.send).toHaveBeenCalledWith(
            `{"name":"","sessionID":"${logger.sessionID}","date":123,"msg":"c","level":"interaction","type":"ERR","stack":"err"}`);
    });

    test("usage binding start", () => {
        logger.logBindingStart("foo");
        expect(logger.ongoingBindings).toHaveLength(1);
        expect(logger.ongoingBindings[0].name).toBe("foo");
        expect(logger.ongoingBindings[0].sessionID).toStrictEqual(logger.sessionID);
        expect(logger.ongoingBindings[0].date).toBe(123);
        expect(logger.ongoingBindings[0].duration).toBe(0);
        expect(logger.ongoingBindings[0].cancelled).toBe(false);
        expect(logger.ongoingBindings[0].frontVersion).toBeUndefined();
    });

    test("usage binding start and end same, cancelled", () => {
        logger.logBindingStart("foo");
        jest.spyOn(performance, "now").mockReturnValueOnce(200);
        logger.logBindingEnd("foo", true);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            `Usage. id:${logger.sessionID} binding:foo date:123 duration:77 cancelled:true`);
    });

    test("usage binding start and end same, not cancelled", () => {
        jest.spyOn(performance, "now").mockRestore();
        jest.spyOn(performance, "now").mockReturnValueOnce(100);
        logger.logBindingStart("b1");
        jest.spyOn(performance, "now").mockReturnValueOnce(300);
        logger.logBindingEnd("b1", false);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            `Usage. id:${logger.sessionID} binding:b1 date:100 duration:200 cancelled:false`);
    });

    test("usage binding start and end but not same", () => {
        logger.logBindingStart("foo");
        jest.spyOn(performance, "now").mockReturnValueOnce(200);
        logger.logBindingEnd("yoo", true);
        expect(logger.ongoingBindings).toHaveLength(1);
        expect(logger.ongoingBindings[0].name).toBe("foo");
        // eslint-disable-next-line no-console
        expect(console.log).not.toHaveBeenCalled();
    });

    test("usage binding start and end start same", () => {
        logger.logBindingStart("binding1");
        jest.spyOn(performance, "now").mockReturnValueOnce(300);
        logger.logBindingEnd("binding1:cmd1", false);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            `Usage. id:${logger.sessionID} binding:binding1:cmd1 date:123 duration:177 cancelled:false`);
    });

    test("usage binding start and end start same with version", () => {
        logger = new LoggerImpl("2.3");
        logger.logBindingStart("binding1");
        jest.spyOn(performance, "now").mockReturnValueOnce(300);
        logger.logBindingEnd("binding1:cmd1", false);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            `Usage. v:2.3 id:${logger.sessionID} binding:binding1:cmd1 date:123 duration:177 cancelled:false`);
    });

    test("usage bindings start and, strange case, several matches at end", () => {
        logger.logBindingStart("binding2");
        logger.logBindingStart("binding2");
        jest.spyOn(performance, "now").mockReturnValueOnce(400);
        logger.logBindingEnd("binding2:cmd2", true);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).not.toHaveBeenCalled();
    });

    test("sevseral usage bindings start and one end", () => {
        logger.logBindingStart("binding2");
        jest.spyOn(performance, "now").mockReturnValueOnce(1000);
        logger.logBindingStart("binding3");
        jest.spyOn(performance, "now").mockReturnValueOnce(1500);
        logger.logBindingEnd("binding3:cmd2", true);
        expect(logger.ongoingBindings).toHaveLength(1);
        expect(logger.ongoingBindings[0].name).toBe("binding2");
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith(
            `Usage. id:${logger.sessionID} binding:binding3:cmd2 date:1000 duration:500 cancelled:true`);
    });

    test("usage binding start and end same, rest", () => {
        const xhrMock: Partial<XMLHttpRequest> = {
            "open": jest.fn(),
            "send": jest.fn(),
            "setRequestHeader": jest.fn()
        };

        jest.spyOn(window, "XMLHttpRequest").mockImplementation(() => xhrMock as XMLHttpRequest);
        logger.writeConsole = false;
        logger.serverAddress = "yolo";
        logger.logBindingStart("foo3");
        jest.spyOn(performance, "now").mockReturnValueOnce(200);
        logger.logBindingEnd("foo3", true);
        expect(logger.ongoingBindings).toHaveLength(0);
        // eslint-disable-next-line no-console
        expect(console.log).not.toHaveBeenCalled();
        expect(xhrMock.open).toHaveBeenCalledWith("POST", "yolo/api/usage", true);
        expect(xhrMock.send).toHaveBeenCalledWith(
            `{"name":"foo3","sessionID":"${logger.sessionID}","date":123,"duration":77,"cancelled":true}`);
    });
});
