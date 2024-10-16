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

import {BindingsContext, BindingsImpl, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {afterEach, beforeEach, describe, expect, jest, test} from "@jest/globals";
import {robot} from "interacto-nono";
import type {UndoHistoryBase, Bindings} from "../../src/interacto";

let button1: HTMLButtonElement;
let cmd: StubCmd;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;

describe("testing an accumulator", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        button1 = document.createElement("button");
        jest.useFakeTimers();
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
    });

    describe("using a cmd having effects", () => {
        beforeEach(() => {
            cmd = new StubCmd(true);
        });

        test("accumulator defined", () => {
            const accs = new Array<unknown>();

            bindings.buttonBinder()
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    accs.push(acc);
                })
                .end((_c, _i, acc) => {
                    accs.push(acc);
                })
                .ifHadEffects((_c, _i, acc) => {
                    accs.push(acc);
                })
                .on(button1)
                .bind();

            button1.click();

            expect(accs).toStrictEqual([{}, {}, {}]);
        });

        test("accumulator typed and propagated through routines", () => {
            const vals = new Array<number>();

            bindings.buttonBinder({"foo": 1})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    vals.push(acc.foo);
                    acc.foo = 2;
                })
                .end((_c, _i, acc) => {
                    vals.push(acc.foo);
                    acc.foo = 10;
                })
                .ifHadEffects((_c, _i, acc) => {
                    vals.push(acc.foo);
                })
                .on(button1)
                .bind();

            button1.click();

            expect(vals).toStrictEqual([1, 2, 10]);
        });

        test("accumulator reinitialized after each interaction execution", () => {
            const vals = new Array<number>();
            const valstr = new Array<string>();

            bindings.buttonBinder({"bar": 0, "yolo": "VALUE"})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    vals.push(acc.bar);
                    valstr.push(acc.yolo);
                    acc.bar = 2;
                    acc.yolo = "STR";
                })
                .on(button1)
                .bind();

            button1.click();
            button1.click();

            expect(vals).toStrictEqual([0, 0]);
            expect(valstr).toStrictEqual(["VALUE", "VALUE"]);
        });

        test("accumulator works for when", () => {
            bindings.buttonBinder({"bar": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.bar = 2;
                })
                .when((_i, acc) => acc.bar === 0)
                .on(button1)
                .bind();

            button1.click();

            expect(ctx.commands).toHaveLength(1);
        });

        test("accumulator works for endorcancel", () => {
            const elt = document.createElement("textarea");
            let val = 0;

            bindings.textInputBinder(1000, {"cpt": 10})
                .toProduce(() => cmd)
                .endOrCancel((_i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            elt.value = "q";
            robot(elt).input();
            jest.runOnlyPendingTimers();

            expect(val).toBe(11);
        });

        test("accumulator not shared between binders", () => {
            const button2 = document.createElement("button");
            const vals = new Array<number>();

            const partial = bindings.buttonBinder({"bar": 0})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    acc.bar++;
                    vals.push(acc.bar);
                });

            partial.on(button1).bind();
            partial.on(button2).bind();

            button1.click();
            button2.click();

            expect(vals).toStrictEqual([1, 1]);
        });

        test("accumulator cloned in deep", () => {
            const vals = new Array<number>();

            bindings.buttonBinder({"bar": {"foo": [1, 10]}})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    acc.bar.foo[0]++;
                    vals.push(...acc.bar.foo);
                })
                .end((_c, _i, acc) => {
                    acc.bar.foo[1]++;
                    vals.push(...acc.bar.foo);
                })
                .on(button1)
                .bind();

            button1.click();

            expect(vals).toStrictEqual([2, 10, 2, 11]);
        });

        test("accumulator works for checkboxBinder", () => {
            const elt = document.createElement("input");
            elt.type = "checkbox";
            let val = 0;

            bindings.checkboxBinder({"foo": 1})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.foo;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBe(1);
        });

        test("accumulator works for color picker", () => {
            const elt = document.createElement("input");
            elt.type = "color";
            let val = 0;

            bindings.colorPickerBinder({"foo": 2})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.foo;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBe(2);
        });

        test("accumulator works for combo box", () => {
            const elt = document.createElement("select");
            let val = 0;

            bindings.comboBoxBinder({"foo": 2})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.foo;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBe(2);
        });

        test("accumulator works for spinner", () => {
            const elt = document.createElement("input");
            elt.type = "number";
            let val = 0;

            bindings.spinnerBinder({"bar": -8})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.bar;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBe(-8);
        });

        test("accumulator works for date picker", () => {
            const elt = document.createElement("input");
            elt.type = "date";
            let val = false;

            bindings.dateBinder({"bar": true})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.bar;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBeTruthy();
        });

        test("accumulator works for hyperlink", () => {
            const elt = document.createElement("a");
            let val = "";

            bindings.hyperlinkBinder({"bar": "a"})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    val = acc.bar;
                })
                .on(elt)
                .bind();

            robot(elt).input();

            expect(val).toBeTruthy();
        });

        test("accumulator works for text input", () => {
            const elt = document.createElement("textarea");
            let val = 0;

            bindings.textInputBinder(1000, {"bar": "", "cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            elt.value = "f";
            robot(elt).input();
            elt.value = "r";
            robot(elt).input();
            elt.value = "q";
            robot(elt).input();
            jest.runOnlyPendingTimers();

            expect(val).toBe(4);
        });

        test("accumulator works for key typed", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.keyTypeBinder({"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .keydown()
                .keyup();

            expect(val).toBe(1);
        });

        test("accumulator works for touch", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.touchDnDBinder(true, {"cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchmove()
                .touchmove()
                .touchend();

            expect(val).toBe(3);
        });

        test("accumulator works with cancel", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.dndBinder(true, {"cpt": 0})
                .toProduce(() => cmd)
                .cancel((_i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .mousedown()
                .mousemove()
                .keydown({"code": "Escape"})
                .mouseup();

            expect(val).toBe(1);
        });

        test("accumulator works for multi touch", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.multiTouchBinder(2, {"cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchstart({}, [{"identifier": 2, "target": elt}])
                .touchmove({}, [{"identifier": 1, "target": elt}])
                .touchmove({}, [{"identifier": 1, "target": elt}])
                .touchmove({}, [{"identifier": 2, "target": elt}])
                .touchend({}, [{"identifier": 1, "target": elt}])
                .touchend({}, [{"identifier": 2, "target": elt}]);

            expect(val).toBe(5);
        });

        test("accumulator works for tap", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.tapsBinder(3, {"cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend()
                .touchstart({}, [{"identifier": 2}])
                .touchend();

            expect(val).toBe(4);
        });

        test("accumulator works for long touch", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.longTouchBinder(1000, {"cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}]);

            jest.runOnlyPendingTimers();

            expect(val).toBe(2);
        });

        test("accumulator works for click", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.clickBinder({"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot().click(elt);

            expect(val).toBe(1);
        });

        test("accumulator works for double click", () => {
            const elt = document.createElement("canvas");
            let val = 0;

            bindings.dbleClickBinder({"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot().click(elt, 2);

            expect(val).toBe(1);
        });

        test("accumulator works for mouse up", () => {
            const elt = document.createElement("canvas");
            let val = 0;
            bindings.mouseUpBinder({"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot().mouseup(elt);
            expect(val).toBe(1);
        });

        test("accumulator works for mouse down", () => {
            const elt = document.createElement("canvas");
            let val = 0;
            bindings.mouseDownBinder({"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot().mousedown(elt);
            expect(val).toBe(1);
        });

        test("accumulator works for long mouse down", () => {
            const elt = document.createElement("canvas");
            let val = 0;
            bindings.longMouseDownBinder(500, {"cpt": 0})
                .toProduce(() => cmd)
                .end((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot().mousedown(elt);
            jest.runOnlyPendingTimers();
            expect(val).toBe(1);
        });

        test("accumulator works for clicks", () => {
            const elt = document.createElement("canvas");
            let val = 0;
            bindings.clicksBinder(3, {"cpt": 0})
                .toProduce(() => cmd)
                .then((_c, _i, acc) => {
                    acc.cpt++;
                    val = acc.cpt;
                })
                .on(elt)
                .bind();

            robot(elt)
                .click()
                .click()
                .click();
            jest.runOnlyPendingTimers();
            expect(val).toBe(3);
        });
    });

    describe("using a cmd not having effects", () => {
        beforeEach(() => {
            cmd = new StubCmd(true, false);
        });

        test("accumulator typed and propagated through routines", () => {
            const vals = new Array<number>();

            bindings.buttonBinder({"foo": -10})
                .toProduce(() => cmd)
                .first((_c, _i, acc) => {
                    vals.push(acc.foo);
                    acc.foo = 5;
                })
                .end((_c, _i, acc) => {
                    vals.push(acc.foo);
                    acc.foo = 12;
                })
                .ifHadNoEffect((_c, _i, acc) => {
                    vals.push(acc.foo);
                })
                .on(button1)
                .bind();

            button1.click();

            expect(vals).toStrictEqual([-10, 5, 12]);
        });
    });
});
