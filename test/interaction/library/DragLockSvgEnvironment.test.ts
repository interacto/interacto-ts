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

import {DragLock, SrcTgtPointsDataImpl} from "../../../src/interacto";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";

describe("using a drag lock interaction on SVG elements", () => {
    let interaction: DragLock;
    let svg: SVGSVGElement;
    let handler: FSMHandler;
    let rect1: SVGRectElement;
    let rect2: SVGRectElement;

    beforeEach(() => {
        handler = mock<FSMHandler>();
        interaction = new DragLock(mock<Logger>());
        interaction.log(true);
        interaction.fsm.log = true;
        interaction.fsm.addHandler(handler);
        document.documentElement.innerHTML = "<html></html>";
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        document.body.append(svg);
        rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        svg.append(rect1);
        svg.append(rect2);
    });

    test("dragLock in a SVG environment", () => {
        interaction.registerToNodes([rect1, rect2]);
        robot()
            .click(rect2, 2, false)
            .mousemove()
            .click(rect1, 2, false);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });

    test("dragLock data in a SVG environment", () => {
        const data = new SrcTgtPointsDataImpl();
        const newHandler = mock<FSMHandler>();
        newHandler.fsmStops = jest.fn(() => {
            data.copySrc(interaction.data.src);
            data.copyTgt(interaction.data.tgt);
        });
        interaction.fsm.addHandler(newHandler);
        interaction.registerToNodes([svg]);

        robot()
            .click({"target": rect1, "clientX": 11, "clientY": 23}, 2, false)
            .mousemove({"target": svg, "clientX": 20, "clientY": 30})
            .click({"target": rect2, "clientX": 22, "clientY": 33}, 2, false);

        expect(data.src.clientX).toBe(11);
        expect(data.src.clientY).toBe(23);
        expect(data.tgt.clientX).toBe(22);
        expect(data.tgt.clientY).toBe(33);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmCancels).not.toHaveBeenCalled();
    });
});
