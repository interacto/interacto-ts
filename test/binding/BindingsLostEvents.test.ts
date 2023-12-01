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

import {BindingsImpl} from "../../src/impl/binding/BindingsImpl";
import {UndoHistoryImpl} from "../../src/impl/undo/UndoHistoryImpl";
import {StubCmd} from "../command/StubCmd";
import {robot} from "../interaction/StubEvents";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {UndoHistoryBase} from "../../src/api/undo/UndoHistoryBase";

let elt: HTMLElement;
let bindings: Bindings<UndoHistoryBase>;
let div2: HTMLElement;

describe("events lost by the browser do not block bindings", () => {
    beforeEach(async () => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        jest.useFakeTimers();
        elt = document.createElement("div");

        div2 = document.createElement("div");
        elt.append(div2);
        await Promise.resolve();
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    describe("with touch events", () => {
        beforeEach(() => {
            bindings.longTouchBinder(100)
                .on(div2)
                .toProduceAnon(() => {
                    div2.remove();
                })
                .bind();
        });

        test("the tap binding not blocked", async () => {
            const b2 = bindings.tapBinder(1)
                .on(elt)
                .toProduce(() => new StubCmd())
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            // Checking that another tap on elt still produces the command
            // (ie, the binding is not stuck because of the pending event)
            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchend();
            expect(b2.timesEnded).toBe(1);
        });

        test("the multi-touch binding not blocked", async () => {
            const b2 = bindings.multiTouchBinder(2)
                .on(elt)
                .toProduce(() => new StubCmd())
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            // Checking that other touch dnds on elt do not trigger the command
            // (ie, the binding is not stuck because of the pending event)
            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchmove()
                .touchend()
                .touchstart({}, [{"identifier": 3}])
                .touchmove()
                .touchend();
            expect(b2.timesEnded).toBe(0);
        });

        test("the touch DnD binding not blocked on touch down", async () => {
            const b2 = bindings.touchDnDBinder(false)
                .on(elt)
                .toProduce(() => new StubCmd())
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            // Checking that other touch dnds on elt do not trigger the command
            // (ie, the binding is not stuck because of the pending event)
            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchmove()
                .touchend();
            expect(b2.timesEnded).toBe(1);
        });

        test("the touch DnD binding not blocked on touch move", async () => {
            div2.addEventListener("touchmove", () => {
                div2.remove();
            });

            const b2 = bindings.touchDnDBinder(false)
                .on(elt)
                .toProduce(() => new StubCmd())
                .bind();

            robot(div2)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchmove();
            await Promise.resolve();
            robot(div2).touchend({}, [{"identifier": 1}]);

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 2}])
                .touchmove()
                .touchend();
            expect(b2.timesEnded).toBe(1);
        });

        test("the swipe binding not blocked", async () => {
            const b2 = bindings.panHorizontalBinder(10, false, 400, 200)
                .on(elt)
                .toProduce(() => new StubCmd())
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            robot(elt)
                .touchstart({}, [{"identifier": 3, "screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200}], 5000)
                .touchmove({}, [{"identifier": 3, "screenX": 160, "screenY": 30, "clientX": 160, "clientY": 201}], 5500)
                .touchmove({}, [{"identifier": 3, "screenX": 250, "screenY": 30, "clientX": 500, "clientY": 210}], 6000)
                .touchend({}, [{"identifier": 3, "screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000);
            expect(b2.timesEnded).toBe(1);
        });

        test("the pan binding not blocked", async () => {
            const b2 = bindings.panBinder(false)
                .toProduce(() => new StubCmd(true))
                .on(elt)
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            robot(elt)
                .keepData()
                .touchstart({}, [{"screenX": 10, "screenY": 20, "clientX": 110, "clientY": 230, "identifier": 2}])
                .touchmove({}, [{"screenX": 10, "screenY": 25, "clientX": 110, "clientY": 233}])
                .touchmove({}, [{"screenX": 10, "screenY": 30, "clientX": 110, "clientY": 240}])
                .touchend({}, [{"screenX": 10, "screenY": 30, "clientX": 110, "clientY": 240}]);

            expect(b2.timesEnded).toBe(1);
        });

        test("the pinch binding not blocked", async () => {
            const b2 = bindings.scaleBinder(10)
                .toProduce(() => new StubCmd(true))
                .on(elt)
                .bind();

            // The first event remove the child
            robot(div2).touchstart({}, [{"identifier": 1}]);
            jest.advanceTimersByTime(200);
            await Promise.resolve();
            // The second event is captured by the child but since removed
            // from its parent, the parent does not capture it
            robot(div2).touchend({}, [{"identifier": 1}]);

            robot(elt)
                .touchstart({}, [{"identifier": 2, "screenX": 15, "screenY": 16, "clientX": 101, "clientY": 200}])
                .touchstart({}, [{"identifier": 3, "screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200}])
                .touchmove({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 102, "clientY": 201}])
                .touchmove({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 100, "clientY": 202}])
                .touchend({}, [{"identifier": 2, "screenX": 20, "screenY": 22, "clientX": 501, "clientY": 210}])
                .touchend({}, [{"identifier": 3, "screenX": 5, "screenY": 6, "clientX": 500, "clientY": 219}]);

            expect(b2.timesEnded).toBe(1);
        });
    });

    test("mouse event triggered by child removed from its parent does not block the binding", async () => {
        bindings.longMouseDownBinder(100)
            .on(div2)
            .toProduceAnon(() => {
                div2.remove();
            })
            .bind();

        const b2 = bindings.dndBinder(false)
            .on(elt)
            .toProduce(() => new StubCmd())
            .bind();

        // The first event remove the child
        robot(div2).mousedown();
        jest.advanceTimersByTime(200);
        await Promise.resolve();
        // The second event is captured by the child but since removed
        // from its parent, the parent does not capture it
        robot(div2).mouseup();

        // Checking that the DnD on elt still produces the command
        // (ie, the binding is not stuck because of the pending event)
        robot(elt)
            .keepData()
            .mousedown()
            .mousemove()
            .mouseup();
        expect(b2.timesEnded).toBe(1);
    });
});
