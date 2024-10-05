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

import {GeneralTwoTouchDataImpl} from "../../src/impl/interaction/GeneralTwoTouchDataImpl";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import type {SrcTgtTouchDataImpl} from "../../src/impl/interaction/SrcTgtTouchDataImpl";

describe("using a touch data", () => {
    let data: GeneralTwoTouchDataImpl;

    beforeEach(() => {
        data = new GeneralTwoTouchDataImpl();
    });

    test("touches three values", () => {
        expect(data.touches).toHaveLength(2);
    });

    test("touches t1", () => {
        expect(data.touches[0]).toBe(data.touch1);
    });

    test("touches t2", () => {
        expect(data.touches[1]).toBe(data.touch2);
    });

    test("flush", () => {
        jest.spyOn(data.touch1 as SrcTgtTouchDataImpl, "flush");
        jest.spyOn(data.touch2 as SrcTgtTouchDataImpl, "flush");

        data.flush();

        expect((data.touch1 as SrcTgtTouchDataImpl).flush).toHaveBeenCalledTimes(1);
        expect((data.touch2 as SrcTgtTouchDataImpl).flush).toHaveBeenCalledTimes(1);
    });

    describe("with values", () => {
        let div: HTMLDivElement;
        let div2: HTMLDivElement;
        let touch1: Touch;
        let touch2: Touch;

        beforeEach(() => {
            div = document.createElement("div");
            div2 = document.createElement("div");
            touch1 = {"identifier": 3, "screenX": 15, "screenY": 20, "clientX": 160,
                "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div};
            touch2 = {"identifier": 2, "screenX": 16, "screenY": 22, "clientX": 150,
                "clientY": 30, "force": 3, "pageX": 1, "pageY": 10, "radiusX": 20, "radiusY": 30, "rotationAngle": -10, "target": div2};

            data.initTouch(touch1,
                {"target": div, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div},
                []);
        });

        test("t1 initialized", () => {
            expect(data.touch1.src.identifier).toBe(3);
            expect(data.touch1.tgt.identifier).toBe(3);
            expect(data.touch1.src.target).toBe(div);
            expect(data.touch1.tgt.target).toBe(div);
            expect(data.touch2.src.target).toBeNull();
            expect(data.touch2.tgt.target).toBeNull();
        });

        test("t2 initialized", () => {
            data.initTouch(touch2,
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);

            expect(data.touch1.src.identifier).toBe(3);
            expect(data.touch1.tgt.identifier).toBe(3);
            expect(data.touch1.src.target).toBe(div);
            expect(data.touch1.tgt.target).toBe(div);
            expect(data.touch2.src.identifier).toBe(2);
            expect(data.touch2.tgt.identifier).toBe(2);
            expect(data.touch2.src.target).toBe(div2);
            expect(data.touch2.tgt.target).toBe(div2);
        });

        test("init does nothing when already init", () => {
            data.initTouch(touch2,
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
            data.initTouch({"identifier": 5, "screenX": 15, "screenY": 20, "clientX": 160,
                "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
            {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
            []);

            expect(data.touch1.src.identifier).toBe(3);
            expect(data.touch1.tgt.identifier).toBe(3);
            expect(data.touch2.src.identifier).toBe(2);
            expect(data.touch2.tgt.identifier).toBe(2);
        });

        test("t1 copy", () => {
            data.copyTouch({"identifier": 3, "screenX": 150, "screenY": 20, "clientX": 160,
                "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
            {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
            []);

            expect(data.touch1.src.identifier).toBe(3);
            expect(data.touch1.tgt.identifier).toBe(3);
            expect(data.touch1.src.screenX).toBe(15);
            expect(data.touch1.tgt.screenX).toBe(150);
            expect(data.touch2.src.target).toBeNull();
            expect(data.touch2.tgt.target).toBeNull();
        });

        describe("with both touches", () => {
            beforeEach(() => {
                data.initTouch(touch2,
                    {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                    []);
            });

            test("t2 copy", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 200, "clientX": 160,
                    "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);

                expect(data.touch1.src.identifier).toBe(3);
                expect(data.touch1.tgt.identifier).toBe(3);
                expect(data.touch2.src.screenY).toBe(22);
                expect(data.touch2.tgt.screenY).toBe(200);
            });

            test("t2 copy bad ID does nothing", () => {
                data.copyTouch({"identifier": 20, "screenX": 1, "screenY": 200, "clientX": 160,
                    "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);

                expect(data.touch1.src.screenY).toBe(20);
                expect(data.touch1.tgt.screenY).toBe(20);
                expect(data.touch2.src.screenY).toBe(22);
                expect(data.touch2.tgt.screenY).toBe(22);
            });

            test("diff clientX", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 200, "clientX": 170,
                    "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 1, "screenY": 200, "clientX": 200,
                    "clientY": 21, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffClientX).toBe(30);
            });

            test("diff clientY", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 200, "clientX": 170,
                    "clientY": 31, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 1, "screenY": 200, "clientX": 200,
                    "clientY": 50, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffClientY).toBe(15);
            });

            test("diff pageX", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 200, "clientX": 170,
                    "clientY": 31, "force": 1, "pageX": 10, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 1, "screenY": 200, "clientX": 200,
                    "clientY": 50, "force": 1, "pageX": 11, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffPageX).toBe(9);
            });

            test("diff pageY", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 200, "clientX": 170,
                    "clientY": 31, "force": 1, "pageX": 2, "pageY": 10, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 1, "screenY": 200, "clientX": 200,
                    "clientY": 50, "force": 1, "pageX": 2, "pageY": 20, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffPageY).toBe(8);
            });

            test("diff screenX", () => {
                data.copyTouch({"identifier": 2, "screenX": 20, "screenY": 30, "clientX": 170,
                    "clientY": 31, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 21, "screenY": 40, "clientX": 200,
                    "clientY": 50, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffScreenX).toBe(5);
            });

            test("diff screenY", () => {
                data.copyTouch({"identifier": 2, "screenX": 1, "screenY": 30, "clientX": 170,
                    "clientY": 31, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                data.copyTouch({"identifier": 3, "screenX": 1, "screenY": 40, "clientX": 200,
                    "clientY": 50, "force": 1, "pageX": 2, "pageY": 4, "radiusX": 10, "radiusY": 23, "rotationAngle": 45, "target": div2},
                {"target": div2, "altKey": true, "ctrlKey": true, "metaKey": true, "shiftKey": false, "timeStamp": 11, "currentTarget": div2},
                []);
                expect(data.diffScreenY).toBe(14);
            });
        });
    });

});
