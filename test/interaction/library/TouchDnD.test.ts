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

import type {FSMHandler, Logger} from "../../../src/interacto";
import {TouchDataImpl, TouchDnD} from "../../../src/interacto";
import {robot} from "../StubEvents";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";

describe("using a touch dnd interaction", () => {
    let interaction: TouchDnD;
    let canvas: HTMLElement;
    let handler: FSMHandler;
    let srcData: TouchDataImpl;
    let tgtData: TouchDataImpl;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        srcData = new TouchDataImpl();
        tgtData = new TouchDataImpl();
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new TouchDnD(logger, true);
        interaction.fsm.addHandler(handler);
        canvas = document.createElement("canvas");
        // document.elementFromPoint is undefined
        document.elementFromPoint = jest.fn().mockImplementation(() => null);
        interaction.registerToNodes([canvas]);
    });

    afterEach(() => {
        interaction.uninstall();
    });

    test("pressure does not start interaction", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 2}]);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(0);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("pressure move", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove();
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("no log interaction is ok", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("pressure move data", () => {
        robot()
            .touchstart(canvas, [{"identifier": 2, "screenX": 11, "screenY": 23, "clientX": 12, "clientY": 25}]);

        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates = jest.fn(() => {
            srcData.copy(interaction.data.src);
            tgtData.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        robot()
            .touchmove(canvas, [{"identifier": 2, "screenX": 141, "screenY": 24, "clientX": 14, "clientY": 28}]);
        expect(srcData.clientX).toBe(12);
        expect(srcData.clientY).toBe(25);
        expect(srcData.screenX).toBe(11);
        expect(srcData.screenY).toBe(23);
        expect(tgtData.clientX).toBe(14);
        expect(tgtData.clientY).toBe(28);
        expect(tgtData.screenX).toBe(141);
        expect(tgtData.screenY).toBe(24);
        expect(srcData.identifier).toBe(2);
        expect(tgtData.identifier).toBe(2);
        expect(srcData.target).toBe(canvas);
        expect(srcData.currentTarget).toBe(canvas);
        expect(tgtData.target).toBe(canvas);
        expect(tgtData.currentTarget).toBe(canvas);
    });

    test("pressure move move KO", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 2}])
            .touchmove()
            .touchmove({}, [{"identifier": 1}]);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("pressure move move OK", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchmove();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("pressure move move OK data", () => {
        robot(canvas)
            .touchstart({}, [{"identifier": 4, "screenX": 111, "screenY": 213, "clientX": 112, "clientY": 215}])
            .touchmove({}, [{"identifier": 4, "screenX": 11, "screenY": 24, "clientX": 14, "clientY": 28}]);

        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates = jest.fn(() => {
            srcData.copy(interaction.data.src);
            tgtData.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        robot()
            .touchmove(canvas, [{"identifier": 4, "screenX": 110, "screenY": 240, "clientX": 140, "clientY": 280}]);

        expect(srcData.clientX).toBe(112);
        expect(srcData.clientY).toBe(215);
        expect(srcData.screenX).toBe(111);
        expect(srcData.screenY).toBe(213);
        expect(tgtData.clientX).toBe(140);
        expect(tgtData.clientY).toBe(280);
        expect(tgtData.screenX).toBe(110);
        expect(tgtData.screenY).toBe(240);
        expect(srcData.identifier).toBe(4);
        expect(srcData.target).toBe(canvas);
        expect(srcData.currentTarget).toBe(canvas);
        expect(tgtData.target).toBe(canvas);
        expect(tgtData.currentTarget).toBe(canvas);
    });

    test("pressure move release", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchend();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("pressure move release data", () => {
        const srcData2 = new TouchDataImpl();
        const tgtData2 = new TouchDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmUpdates = jest.fn(() => {
            srcData.copy(interaction.data.src);
            tgtData.copy(interaction.data.tgt);
        });
        newHandler.fsmStops = jest.fn(() => {
            srcData2.copy(interaction.data.src);
            tgtData2.copy(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);

        robot(canvas)
            .touchstart({}, [{"identifier": 0, "screenX": 111, "screenY": 231, "clientX": 121, "clientY": 251}])
            .touchmove({}, [{"identifier": 0, "screenX": 11, "screenY": 24, "clientX": 14, "clientY": 28}])
            .touchend({}, [{"identifier": 0, "screenX": 110, "screenY": 240, "clientX": 140, "clientY": 280}]);

        expect(srcData.clientX).toBe(121);
        expect(srcData.clientY).toBe(251);
        expect(srcData.screenX).toBe(111);
        expect(srcData.screenY).toBe(231);
        expect(tgtData.clientX).toBe(14);
        expect(tgtData.clientY).toBe(28);
        expect(tgtData.screenX).toBe(11);
        expect(tgtData.screenY).toBe(24);
        expect(srcData.identifier).toBe(0);
        expect(tgtData.identifier).toBe(0);
        expect(srcData.target).toBe(canvas);
        expect(srcData.currentTarget).toBe(canvas);
        expect(tgtData.target).toBe(canvas);
        expect(tgtData.currentTarget).toBe(canvas);
        expect(srcData.allTouches).toHaveLength(1);
        expect(srcData.allTouches[0].identifier).toBe(0);

        expect(srcData2.clientX).toBe(121);
        expect(srcData2.clientY).toBe(251);
        expect(srcData2.screenX).toBe(111);
        expect(srcData2.screenY).toBe(231);
        expect(tgtData2.clientX).toBe(140);
        expect(tgtData2.clientY).toBe(280);
        expect(tgtData2.screenX).toBe(110);
        expect(tgtData2.screenY).toBe(240);
        expect(srcData2.identifier).toBe(0);
        expect(tgtData2.identifier).toBe(0);
        expect(srcData2.target).toBe(canvas);
        expect(tgtData2.target).toBe(canvas);
    });

    test("pressure move release KO", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchend({}, [{"identifier": 2}]);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("pressure move move release", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchmove()
            .touchend();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("touch restart", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchmove()
            .touchend()
            .touchstart()
            .touchmove()
            .touchmove();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    });

    test("no modifiers and button", () => {
        expect(interaction.data.src.altKey).toBeFalsy();
        expect(interaction.data.src.ctrlKey).toBeFalsy();
        expect(interaction.data.src.metaKey).toBeFalsy();
        expect(interaction.data.src.shiftKey).toBeFalsy();
    });

    test("move data", () => {
        let diffClientX: number | undefined;
        let diffClientY: number | undefined;
        let diffScreenX: number | undefined;
        let diffScreenY: number | undefined;

        interaction.fsm.addHandler({
            "fsmStops": () => {
                diffClientX = interaction.data.diffClientX;
                diffClientY = interaction.data.diffClientY;
                diffScreenX = interaction.data.diffScreenX;
                diffScreenY = interaction.data.diffScreenY;
            }
        });

        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3, "screenX": 11, "screenY": 23, "clientX": 12, "clientY": 25}])
            .touchmove({}, [{"identifier": 3, "screenX": 11, "screenY": 24, "clientX": 14, "clientY": 28}])
            .touchend({}, [{"identifier": 3, "screenX": 171, "screenY": 274, "clientX": 174, "clientY": 278}]);

        expect(diffClientX).toBe(162);
        expect(diffClientY).toBe(253);
        expect(diffScreenX).toBe(160);
        expect(diffScreenY).toBe(251);
    });

    test("release on dwell-spring cancels interaction", () => {
        const div = document.createElement("div");
        canvas.append(div);
        div.classList.add("ioDwellSpring");
        interaction.registerToNodes([canvas, div]);
        document.elementFromPoint = jest.fn().mockImplementation(() => div);

        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchmove()
            .touchend(div);

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(handler.fsmCancels).toHaveBeenCalledTimes(1);
    });

    test("several touches before the DnD does not prevent the DnD", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 1}])
            .touchend()
            .touchstart({}, [{"identifier": 2}])
            .touchmove({}, [{"identifier": 2}])
            .touchmove()
            .touchend();

        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(interaction.isRunning()).toBeFalsy();
    });

    test("pressure release with no move must stop the DnD", () => {
        robot(canvas)
            .keepData()
            .touchstart({}, [{"identifier": 3}])
            .touchend();

        expect(handler.fsmStarts).not.toHaveBeenCalled();
        expect(handler.fsmCancels).not.toHaveBeenCalled();
        expect(handler.fsmStops).not.toHaveBeenCalled();
        expect(interaction.isRunning()).toBeFalsy();
    });

    describe("not cancellable", () => {
        beforeEach(() => {
            srcData = new TouchDataImpl();
            tgtData = new TouchDataImpl();
            handler = mock<FSMHandler>();
            interaction = new TouchDnD(mock<Logger>(), false);
            interaction.log(true);
            interaction.fsm.log = true;
            interaction.fsm.addHandler(handler);
            canvas = document.createElement("canvas");
            // document.elementFromPoint is undefined
            document.elementFromPoint = jest.fn().mockImplementation(() => null);
            interaction.registerToNodes([canvas]);
        });

        test("move data", () => {
            let diffClientX: number | undefined;
            let diffClientY: number | undefined;
            let diffScreenX: number | undefined;
            let diffScreenY: number | undefined;

            interaction.fsm.addHandler({
                "fsmStops": () => {
                    diffClientX = interaction.data.diffClientX;
                    diffClientY = interaction.data.diffClientY;
                    diffScreenX = interaction.data.diffScreenX;
                    diffScreenY = interaction.data.diffScreenY;
                }
            });

            robot(canvas)
                .touchstart({}, [{"identifier": 3, "screenX": 11, "screenY": 23, "clientX": 12, "clientY": 25}])
                .touchmove({}, [{"identifier": 3, "screenX": 11, "screenY": 24, "clientX": 14, "clientY": 28}])
                .touchend({}, [{"identifier": 3, "screenX": 171, "screenY": 274, "clientX": 174, "clientY": 278}]);

            expect(diffClientX).toBe(162);
            expect(diffClientY).toBe(253);
            expect(diffScreenX).toBe(160);
            expect(diffScreenY).toBe(251);
        });

        test("release on dwell-spring does not cancel interaction", () => {
            const div = document.createElement("div");
            canvas.append(div);
            div.classList.add("ioDwellSpring");
            interaction.registerToNodes([canvas, div]);
            document.elementFromPoint = jest.fn().mockImplementation(() => div);

            robot(canvas)
                .keepData()
                .touchstart({}, [{"identifier": 3}])
                .touchmove()
                .touchend(div, [{"identifier": 3}]);

            expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
            expect(handler.fsmStops).toHaveBeenCalledTimes(1);
            expect(handler.fsmCancels).not.toHaveBeenCalled();
        });
    });
});
