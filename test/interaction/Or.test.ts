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

import {mock} from "jest-mock-extended";
import type {MockProxy} from "jest-mock-extended";
import type {FSMHandler, KeysData, Logger} from "../../src/interacto";
import {Clicks, KeysDataImpl, KeysTyped, PointsDataImpl, MouseDown, Or, TouchStart} from "../../src/interacto";
import {robot} from "interacto-nono";

describe("testing an OR interaction", () => {
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let handler1: FSMHandler;
    let handler2: FSMHandler;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        handler1 = mock<FSMHandler>();
        handler2 = mock<FSMHandler>();
        logger = mock<Logger>();
        canvas = document.createElement("canvas");
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
    });

    describe("that uses mousedown and touchstart", () => {
        let i1: MouseDown;
        let i2: TouchStart;
        let interaction: Or<MouseDown, TouchStart>;

        beforeEach(() => {
            i1 = new MouseDown(logger);
            i2 = new TouchStart(logger);
            i1.fsm.addHandler(handler1);
            i2.fsm.addHandler(handler2);
            interaction = new Or(i1, i2, logger);
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("nb FSMs OK", () => {
            expect(interaction.fsm.getAllConccurFSMs()).toHaveLength(2);
        });

        test("mouse down on the canvas starts and stops the Or interaction", () => {
            robot(canvas).mousedown();
            expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler2.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("touch start on the canvas starts and stops the Or interaction", () => {
            robot(canvas).touchstart({}, [{"identifier": 1}]);
            expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler2.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler1.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });
    });

    describe("that uses clicks and a keys typed", () => {
        let i1: Clicks;
        let i2: KeysTyped;
        let interaction: Or<typeof i1, typeof i2>;

        beforeEach(() => {
            i1 = new Clicks(2, logger);
            i2 = new KeysTyped(logger);
            i1.fsm.addHandler(handler1);
            i2.fsm.addHandler(handler2);
            interaction = new Or(i1, i2, logger);
            interaction.fsm.addHandler(handler);
            interaction.registerToNodes([canvas]);
        });

        afterEach(() => {
            interaction.uninstall();
        });

        test("mouse down on the canvas starts the OR interaction", () => {
            robot(canvas).click();
            expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler1.fsmStops).not.toHaveBeenCalled();
            expect(handler2.fsmStarts).not.toHaveBeenCalled();
            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).not.toHaveBeenCalled();
        });

        test("mouse down on the canvas provides to good data", () => {
            robot(canvas).click();
            expect(interaction.data).toBeInstanceOf(PointsDataImpl);
        });

        test("type on the canvas provides the good type of data", () => {
            robot(canvas).write("a");
            expect(interaction.data).toBeInstanceOf(KeysDataImpl);
        });

        test("type on the canvas provides the good of data", () => {
            robot(canvas).write("bd");
            expect((interaction.data as KeysData).keys.map(k => k.code).join("")).toBe("bd");
        });

        test("one interaction stops, the main restarts", () => {
            robot(canvas).click(undefined, 2);
            expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler1.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        });

        test("once an interaction has stopped, a new one can restart", () => {
            robot(canvas).click(undefined, 2);
            robot(canvas).write("ab");
            expect(handler1.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler2.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
        });

        test("reinit", () => {
            jest.spyOn(i1, "reinit");
            jest.spyOn(i2, "reinit");
            interaction.reinit();
            expect(i1.reinit).toHaveBeenCalledTimes(1);
            expect(i2.reinit).toHaveBeenCalledTimes(1);
        });

        test("full reinit", () => {
            jest.spyOn(i1, "fullReinit");
            jest.spyOn(i2, "fullReinit");
            interaction.fullReinit();
            expect(i1.fullReinit).toHaveBeenCalledTimes(1);
            expect(i2.fullReinit).toHaveBeenCalledTimes(1);
        });

        test("uninstall", () => {
            jest.spyOn(i1, "uninstall");
            jest.spyOn(i2, "uninstall");
            interaction.uninstall();
            expect(i1.uninstall).toHaveBeenCalledTimes(1);
            expect(i2.uninstall).toHaveBeenCalledTimes(1);
        });

        test("reinitData", () => {
            jest.spyOn(i1, "reinitData");
            jest.spyOn(i2, "reinitData");
            interaction.reinitData();
            expect(i1.reinitData).toHaveBeenCalledTimes(1);
            expect(i2.reinitData).toHaveBeenCalledTimes(1);
        });

        test("once an interaction has stopped, it is reinit", () => {
            jest.spyOn(i1, "reinitData");
            jest.spyOn(i2, "reinitData");
            jest.spyOn(interaction, "reinitData");
            robot(canvas).click(undefined, 2);
            expect(i1.reinitData).toHaveBeenCalledTimes(2);
        });
    });

    describe("that uses two similar interactions", () => {
        let i1: Clicks;
        let i2: Clicks;

        beforeEach(() => {
            i1 = new Clicks(2, logger);
            i2 = new Clicks(3, logger);
        });

        afterEach(() => {
            i1.uninstall();
            i2.uninstall();
        });

        test("the XOR interaction cannot be created", () => {
            expect(() => new Or(i1, i2, logger)).toThrow("Cannot create an XOR interaction using two interactions of the same type");
        });
    });

    // eslint-disable-next-line jest/no-commented-out-tests
    // describe("that uses two interactions that start with the same event", () => {
    //     let i1: Clicks;
    //     let i2: Click;

    //     beforeEach(() => {
    //         i1 = new Clicks(2, logger);
    //         i2 = new Click(logger);
    //     });

    //     afterEach(() => {
    //         i1.uninstall();
    //         i2.uninstall();
    //     });

    // eslint-disable-next-line jest/no-commented-out-tests
    //     test("the XOR interaction cannot be created", () => {
    //         expect(() => new Or(i1, i2, logger)).toThrow("");
    //     });
    // });
});
