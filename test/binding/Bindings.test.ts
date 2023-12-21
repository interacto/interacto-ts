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

import {
    AnonCmd,
    BindingsContext,
    BindingsImpl,
    Click,
    KeyTyped,
    UndoHistoryImpl
} from "../../src/interacto";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import {createMouseEvent, robot} from "../interaction/StubEvents";
import {mock} from "jest-mock-extended";
import type {
    Binding,
    Bindings,
    BindingsObserver,
    Command,
    EltRef,
    Interaction,
    InteractionCmdUpdateBinder,
    InteractionData,
    KeyData,
    KeysData,
    Logger,
    MousePointsData,
    MultiTouchData,
    PointData,
    ScrollData,
    SrcTgtPointsData,
    TapsData,
    ThenData,
    TouchData,
    UndoHistory,
    UndoHistoryBase,
    VisitorBinding,
    WidgetData
} from "../../src/interacto";
import type {MouseEventForTest} from "../interaction/StubEvents";

let elt: HTMLElement;
let ctx: BindingsContext;
let bindings: Bindings<UndoHistoryBase>;
let logger: Logger;

describe("using bindings", () => {
    beforeEach(() => {
        logger = mock<Logger>();
        bindings = new BindingsImpl(new UndoHistoryImpl(), logger);
        ctx = new BindingsContext();
        bindings.setBindingObserver(ctx);
        jest.useFakeTimers();
        elt = document.createElement("div");
    });

    afterEach(() => {
        bindings.clear();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test("with specific history", () => {
        const h = mock<UndoHistory>();
        bindings = new BindingsImpl(h);

        expect(h).toBe(bindings.undoHistory);
    });

    test("accept visitor works", () => {
        const visitor: VisitorBinding = mock<VisitorBinding>();
        bindings.acceptVisitor(visitor);
        expect(visitor.visitBindings).toHaveBeenCalledTimes(1);
        expect(visitor.visitBindings).toHaveBeenCalledWith(bindings);
    });

    test("change binding observer", () => {
        const o1 = mock<BindingsObserver>();
        const o2 = mock<BindingsObserver>();
        const o3 = mock<BindingsObserver>();
        bindings.setBindingObserver(o1);
        bindings.setBindingObserver(o2);
        bindings.setBindingObserver(o3);

        expect(o1.clearObservedBindings).toHaveBeenCalledTimes(1);
        expect(o2.clearObservedBindings).toHaveBeenCalledTimes(1);
        expect(o3.clearObservedBindings).not.toHaveBeenCalled();
    });

    test("mouse down binder", () => {
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt).mousedown();
        expect(ctx.bindings).toHaveLength(1);
        expect(ctx.commands).toHaveLength(1);
    });

    test("toProduceAnon works", () => {
        const fn = jest.fn();

        bindings.mouseDownBinder()
            .on(elt)
            .toProduceAnon(fn)
            .bind();

        robot(elt).mousedown();

        expect(ctx.commands).toHaveLength(1);
        expect(ctx.commands[0]).toBeInstanceOf(AnonCmd);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test("crash in execute using toProduceAnon", () => {
        const fn = jest.fn();

        bindings.mouseDownBinder()
            .on(elt)
            .toProduceAnon(() => {
                throw new Error("errooor2");
            })
            .catch(fn)
            .bind();
        robot(elt).mousedown();

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("errooor2"));
    });

    test("crash in execute", () => {
        const fn = jest.fn();

        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new AnonCmd(() => {
                throw new Error("errooor");
            }))
            .catch(fn)
            .bind();
        robot(elt).mousedown();

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("errooor"));
    });

    test("mouse up binder", () => {
        bindings.mouseUpBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt).mouseup();
        expect(ctx.bindings).toHaveLength(1);
        expect(ctx.commands).toHaveLength(1);
    });

    test("log cmd binding", () => {
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .log("command", "binding")
            .bind();
        robot(elt).mousedown();
        expect(logger.logCmdMsg).toHaveBeenCalledTimes(4);
        expect(logger.logBindingMsg).toHaveBeenCalledTimes(5);
    });

    test("log interaction binding", () => {
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .log("interaction")
            .bind();
        robot(elt).mousedown();
        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(4);
    });

    test("continous execution with command not undoable", () => {
        bindings.dndBinder(true)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .log("interaction", "command", "binding")
            .continuousExecution()
            .bind();

        robot(elt)
            .mousedown()
            .mousemove()
            .mousemove()
            .keydown({"code": "Escape"});

        expect(logger.logInteractionErr).toHaveBeenCalledTimes(0);
        expect(logger.logBindingErr).toHaveBeenCalledTimes(1);
        expect(logger.logCmdErr).toHaveBeenCalledTimes(0);
    });

    test("undoable command registered", () => {
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubUndoableCmd(true))
            .bind();
        robot(elt).mousedown();
        expect(bindings.undoHistory.getLastUndo()).toBeDefined();
    });

    test("undo redo binders on undo", () => {
        const undo = document.createElement("button");
        const redo = document.createElement("button");
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubUndoableCmd(true))
            .bind();
        const undos = bindings.undoRedoBinder(undo, redo);
        robot()
            .mousedown(elt)
            .click(undo);

        expect(bindings.undoHistory.getLastRedo()).toBeDefined();
        expect(bindings.undoHistory.getLastUndo()).toBeUndefined();
        expect(ctx.getCmdsProducedBy(undos[0])).toHaveLength(1);
    });

    test("undo redo binders on redo", () => {
        const undo = document.createElement("button");
        const redo = document.createElement("button");
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce(() => new StubUndoableCmd(true))
            .bind();
        const undos = bindings.undoRedoBinder(undo, redo);

        robot()
            .mousedown(elt)
            .click(undo)
            .click(redo);
        expect(bindings.undoHistory.getLastRedo()).toBeUndefined();
        expect(bindings.undoHistory.getLastUndo()).toBeDefined();
        expect(ctx.getCmdsProducedBy(undos[1])).toHaveLength(1);
    });

    test("press binder with ElementRef", () => {
        const eltRef: EltRef<EventTarget> = {
            "nativeElement": elt
        };
        bindings.mouseDownBinder()
            .on(eltRef)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().mousedown(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("click binder", () => {
        bindings.clickBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().click(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("click binder crashes in command", () => {
        const fn = jest.fn();

        bindings.clickBinder()
            .on(elt)
            .toProduce(() => new AnonCmd(() => {
                throw new Error("eer");
            }))
            .catch(fn)
            .bind();

        robot(elt).click();

        expect(ctx.commands).toHaveLength(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("eer"));
    });

    test("double click binder", () => {
        bindings.dbleClickBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt).click({}, 2);
        expect(ctx.commands).toHaveLength(1);
    });

    test("double click binder crashes in command", () => {
        const fn = jest.fn();

        bindings.dbleClickBinder()
            .on(elt)
            .toProduceAnon(() => {
                throw new Error("eer");
            })
            .catch(fn)
            .bind();

        robot(elt).click({}, 2);

        expect(ctx.commands).toHaveLength(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("eer"));
    });

    test("mouseenter binder", () => {
        bindings.mouseEnterBinder(true)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().mouseover(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("mouseleave binder", () => {
        bindings.mouseLeaveBinder(true)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().mouseout(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("mousemove binder", () => {
        bindings.mouseMoveBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().mousemove(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("wheel binder", () => {
        bindings.wheelBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot().wheel(elt);
        expect(ctx.commands).toHaveLength(1);
    });

    test("drag lock binder", () => {
        bindings.dragLockBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt)
            .click({}, 2)
            .mousemove()
            .click({}, 2);
        expect(ctx.commands).toHaveLength(1);
    });

    test("drag lock binder crash in command", () => {
        const fn = jest.fn();

        bindings.dragLockBinder()
            .on(elt)
            .toProduce(() => new AnonCmd(() => {
                throw new Error("eer");
            }))
            .catch(fn)
            .bind();

        robot(elt)
            .click({}, 2)
            .mousemove()
            .click({}, 2);

        expect(ctx.commands).toHaveLength(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("eer"));
    });

    test("dnd binder", () => {
        bindings.dndBinder(false)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt)
            .mousedown()
            .mousemove()
            .mouseup();
        expect(ctx.commands).toHaveLength(1);
    });

    test("dnd binder with throttling", () => {
        const fsm = bindings.dndBinder(false)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .throttle(20)
            .bind()
            .interaction
            .fsm;
        jest.spyOn(fsm, "process");

        const evt1: MouseEventForTest = createMouseEvent("mousedown", elt, 1, 2) as MouseEventForTest;
        const evt2: MouseEventForTest = createMouseEvent("mousemove", elt, 3, 4) as MouseEventForTest;
        const evt3: MouseEventForTest = createMouseEvent("mousemove", elt, 3, 4) as MouseEventForTest;
        const evt4: MouseEventForTest = createMouseEvent("mousemove", elt, 5, 6) as MouseEventForTest;
        const evt5: MouseEventForTest = createMouseEvent("mousemove", elt, 7, 8) as MouseEventForTest;
        const evt6: MouseEventForTest = createMouseEvent("mousemove", elt, 9, 10) as MouseEventForTest;
        const evt7: MouseEventForTest = createMouseEvent("mouseup", elt) as MouseEventForTest;
        evt1.id = 1;
        evt2.id = 2;
        evt3.id = 3;
        evt4.id = 4;
        evt5.id = 5;
        evt6.id = 6;
        evt7.id = 7;

        elt.dispatchEvent(evt1);
        jest.advanceTimersByTime(22);
        elt.dispatchEvent(evt2);
        jest.advanceTimersByTime(21);
        elt.dispatchEvent(evt3);
        jest.advanceTimersByTime(10);
        elt.dispatchEvent(evt4);
        jest.advanceTimersByTime(2);
        elt.dispatchEvent(evt5);
        jest.advanceTimersByTime(2);
        elt.dispatchEvent(evt6);
        jest.advanceTimersByTime(21);
        elt.dispatchEvent(evt7);
        jest.runAllTimers();

        expect(ctx.commands).toHaveLength(1);
        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt2);
        expect(fsm.process).toHaveBeenNthCalledWith(3, evt6);
        expect(fsm.process).toHaveBeenNthCalledWith(4, evt7);
        expect(fsm.process).toHaveBeenCalledTimes(4);
    });

    test("dnd binder with throttling 2", () => {
        const fsm = bindings.dndBinder(false)
            .throttle(200)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind()
            .interaction
            .fsm;
        jest.spyOn(fsm, "process");

        const evt1: MouseEventForTest = createMouseEvent("mousedown", elt, 1, 2) as MouseEventForTest;
        const evt2: MouseEventForTest = createMouseEvent("mousemove", elt, 3, 4) as MouseEventForTest;
        const evt3: MouseEventForTest = createMouseEvent("mousemove", elt, 3, 4) as MouseEventForTest;
        const evt4: MouseEventForTest = createMouseEvent("mousemove", elt, 5, 6) as MouseEventForTest;
        const evt5: MouseEventForTest = createMouseEvent("mousemove", elt, 7, 8) as MouseEventForTest;
        const evt6: MouseEventForTest = createMouseEvent("mousemove", elt, 9, 10) as MouseEventForTest;
        const evt7: MouseEventForTest = createMouseEvent("mouseup", elt) as MouseEventForTest;
        evt1.id = 1;
        evt2.id = 2;
        evt3.id = 3;
        evt4.id = 4;
        evt5.id = 5;
        evt6.id = 6;
        evt7.id = 7;

        elt.dispatchEvent(evt1);
        jest.advanceTimersByTime(199);
        elt.dispatchEvent(evt2);
        jest.advanceTimersByTime(199);
        elt.dispatchEvent(evt3);
        jest.advanceTimersByTime(199);
        elt.dispatchEvent(evt4);
        jest.advanceTimersByTime(200);
        elt.dispatchEvent(evt5);
        jest.advanceTimersByTime(199);
        elt.dispatchEvent(evt6);
        jest.advanceTimersByTime(200);
        elt.dispatchEvent(evt7);
        jest.runAllTimers();

        expect(ctx.commands).toHaveLength(1);
        expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
        expect(fsm.process).toHaveBeenNthCalledWith(2, evt4);
        expect(fsm.process).toHaveBeenNthCalledWith(3, evt6);
        expect(fsm.process).toHaveBeenNthCalledWith(4, evt7);
        expect(fsm.process).toHaveBeenCalledTimes(4);
    });

    test("reciprocal DnD binder", () => {
        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const spring = document.createElementNS("http://www.w3.org/2000/svg", "line");
        handle.setAttribute("r", "50");
        const handleRef: EltRef<SVGCircleElement> = {"nativeElement": handle};
        const springRef: EltRef<SVGLineElement> = {"nativeElement": spring};
        const cancel = jest.fn();
        elt.append(handle);
        elt.append(spring);
        handle.classList.add("ioDwellSpring");

        bindings.reciprocalDndBinder(handleRef, springRef)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .cancel(cancel)
            .bind();
        robot(elt)
            .mousedown()
            .mousemove()
            .mouseup()
            .mousedown()
            .mousemove();
        robot(handle)
            .mouseup();

        expect(ctx.commands).toHaveLength(1);
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    test("reciprocal touch DnD binder", () => {
        const handle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const spring = document.createElementNS("http://www.w3.org/2000/svg", "line");
        handle.setAttribute("r", "50");
        const handleRef: EltRef<SVGCircleElement> = {"nativeElement": handle};
        const springRef: EltRef<SVGLineElement> = {"nativeElement": spring};
        const cancel = jest.fn();
        elt.append(handle);
        elt.append(spring);
        handle.classList.add("ioDwellSpring");

        // document.elementFromPoint is undefined
        document.elementFromPoint = jest.fn().mockImplementation(() => null);

        bindings.reciprocalTouchDnDBinder(handleRef, springRef)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .cancel(cancel)
            .bind();
        robot(elt)
            .keepData()
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove()
            .touchend()
            .touchstart()
            .touchmove();
        document.elementFromPoint = jest.fn().mockImplementation(() => handle);
        robot(handle)
            .touchend({}, [{"identifier": 1, "target": handle}]);

        expect(ctx.commands).toHaveLength(1);
        expect(cancel).toHaveBeenCalledTimes(1);
    });

    test("key down binder", () => {
        bindings.keyDownBinder(false)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt).keydown({"code": "A"});
        expect(ctx.commands).toHaveLength(1);
    });

    test("key up binder", () => {
        bindings.keyUpBinder(false)
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt).keyup({"code": "A"});
        expect(ctx.commands).toHaveLength(1);
    });

    test("key type binder", () => {
        bindings.keyTypeBinder()
            .on(elt)
            .toProduce(() => new StubCmd(true))
            .bind();
        robot(elt)
            .keepData()
            .keydown({"code": "A"})
            .keyup();
        expect(ctx.commands).toHaveLength(1);
    });

    test("key type crashes in command", () => {
        const fn = jest.fn();

        bindings.keyTypeBinder()
            .on(elt)
            .toProduce(() => new AnonCmd(() => {
                throw new Error("eer");
            }))
            .catch(fn)
            .bind();

        robot(elt)
            .keepData()
            .keydown({"code": "A"})
            .keyup();

        expect(ctx.commands).toHaveLength(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("eer"));
    });

    test("click must not block drag lock", () => {
        bindings.dragLockBinder()
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            // eslint-disable-next-line jest/no-conditional-in-test
            .when(i => i.src.button === 2 && i.tgt.button === 2)
            .log("interaction")
            .bind();

        robot(elt)
            .click({"button": 1})
            .runOnlyPendingTimers()
            .auxclick({"button": 2}, 2)
            .mousemove()
            .mousemove()
            .auxclick({"button": 2}, 2);

        expect(ctx.commands).toHaveLength(1);
    });

    test("drag lock: double click does not cancel", () => {
        const binding = bindings.dragLockBinder()
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .log("interaction")
            .bind();

        robot(elt)
            .keepData()
            .click({"button": 0})
            .click();

        expect(binding.interaction.isRunning()).toBeTruthy();
    });

    test("drag lock: first then end", () => {
        const first = jest.fn();
        const end = jest.fn();
        const then = jest.fn();
        const endcancel = jest.fn();
        bindings.dragLockBinder()
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .end(end)
            .endOrCancel(endcancel)
            .first(first)
            .then(then)
            .bind();

        robot(elt)
            .click({"button": 1})
            .runOnlyPendingTimers()
            .auxclick({"button": 2}, 2)
            .mousemove()
            .mousemove()
            .auxclick({"button": 2}, 2);

        expect(first).toHaveBeenCalledTimes(1);
        expect(end).toHaveBeenCalledTimes(1);
        expect(then).toHaveBeenCalledTimes(4);
        expect(endcancel).toHaveBeenCalledTimes(1);
    });

    test("binding with anon command", () => {
        bindings.clickBinder()
            .on(elt)
            .toProduce((_i: PointData) => new AnonCmd(() => {}))
            .log("interaction")
            .bind();

        robot(elt).click();

        expect(ctx.commands).toHaveLength(1);
    });

    test("touch DnD binding", () => {
        bindings.touchDnDBinder(false)
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<TouchData>) => new StubCmd(true))
            .bind();

        robot(elt)
            .keepData()
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove()
            .touchend();

        expect(ctx.commands).toHaveLength(1);
    });

    test("clicks binding work", () => {
        bindings.clicksBinder(3)
            .on(elt)
            .when(_i => true)
            .toProduce((_i: MousePointsData) => new StubCmd(true))
            .then((_c, _i) => {})
            .bind();

        robot().click(elt, 3);

        expect(ctx.commands).toHaveLength(1);
    });

    test("longmousedown binding work", () => {
        bindings.longMouseDownBinder(500)
            .on(elt)
            .when(_i => true)
            .toProduce((_i: PointData) => new StubCmd(true))
            .then((_c, _i) => {})
            .first((_c, _i) => {})
            .bind();

        robot(elt).mousedown();
        jest.runAllTimers();

        expect(ctx.commands).toHaveLength(1);
    });

    test("that hyperlink binder works", () => {
        const url = document.createElement("a");

        bindings.hyperlinkBinder()
            .toProduce((_i: WidgetData<HTMLAnchorElement>) => new StubCmd(true))
            .on(url)
            .bind();

        robot(url).input();

        expect(ctx.commands).toHaveLength(1);
    });

    test("that swipe binder works", () => {
        bindings.panRightBinder(10, false, 400, 200)
            .toProduce((_i: SrcTgtPointsData<TouchData>) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .keepData()
            .touchstart({},
                [{"screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200, "identifier": 2, "target": elt}], 5000)
            .touchmove({},
                [{"screenX": 170, "screenY": 30, "clientX": 161, "clientY": 202}], 5500)
            .touchmove({},
                [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000)
            .touchend({},
                [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210}], 6000);

        expect(ctx.commands).toHaveLength(1);
    });

    test("that pinch binder works", () => {
        bindings.scaleBinder(10)
            .toProduce((_i: MultiTouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({},
                [{"screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200, "identifier": 2}])
            .touchstart({},
                [{"screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200, "identifier": 3}])
            .touchmove({},
                [{"screenX": 20, "screenY": 22, "clientX": 100, "clientY": 200, "identifier": 2}])
            .touchmove({},
                [{"screenX": 5, "screenY": 6, "clientX": 100, "clientY": 200, "identifier": 3}])
            .touchend({},
                [{"screenX": 20, "screenY": 22, "clientX": 500, "clientY": 210, "identifier": 2}])
            .touchend({},
                [{"screenX": 5, "screenY": 6, "clientX": 500, "clientY": 210, "identifier": 3}]);

        expect(ctx.commands).toHaveLength(1);
    });

    test("that multi-touch binder works", () => {
        bindings.multiTouchBinder(2)
            .toProduce((_i: MultiTouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({},
                [{"screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200, "identifier": 2}])
            .touchstart({},
                [{"screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200, "identifier": 3}])
            .touchend({},
                [{"screenX": 5, "screenY": 6, "clientX": 500, "clientY": 210, "identifier": 3}]);

        expect(ctx.commands).toHaveLength(1);
    });

    test("that touch start binder works", () => {
        bindings.touchStartBinder()
            .toProduce((_i: TouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot().touchstart(elt, [{"identifier": 2}]);

        expect(ctx.commands).toHaveLength(1);
    });

    test("multi-touch binder with crash in command", () => {
        const fn = jest.fn();

        bindings.multiTouchBinder(2)
            .toProduce(() => new AnonCmd(() => {
                throw new Error("eer");
            }))
            .catch(fn)
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({},
                [{"screenX": 15, "screenY": 16, "clientX": 100, "clientY": 200, "identifier": 2}])
            .touchstart({},
                [{"screenX": 10, "screenY": 11, "clientX": 100, "clientY": 200, "identifier": 3}])
            .touchend({},
                [{"screenX": 5, "screenY": 6, "clientX": 500, "clientY": 210, "identifier": 3}]);

        expect(ctx.commands).toHaveLength(0);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(new Error("eer"));
    });

    test("that scroll binder works", () => {
        bindings.scrollBinder()
            .on(elt)
            .toProduce((_i: ScrollData) => new StubCmd(true))
            .bind();

        robot(elt).scroll();

        expect(ctx.commands).toHaveLength(1);
    });

    test("that keysDown binder works", () => {
        bindings.keysDownBinder()
            .on(elt)
            .toProduce((_i: KeysData) => new StubCmd(true))
            .bind();

        robot(elt)
            .keydown({"code": "A"})
            .keepData()
            .keydown({"code": "B"})
            .keyup();

        expect(ctx.commands).toHaveLength(1);
    });

    test("that 'ifCannotExecute' is correctly called", () => {
        const mockFn = jest.fn();
        const cmd = new StubCmd(false);
        bindings.mouseDownBinder()
            .on(elt)
            .toProduce((_i: PointData) => cmd)
            .ifCannotExecute(mockFn)
            .bind();

        robot(elt).mousedown();

        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(ctx.commands).toHaveLength(0);
    });

    test("that 'strictStart' works correctly when the 'when' routine returns true", () => {
        bindings.dndBinder(false)
            .when((_i: SrcTgtPointsData<PointData>) => true, "strictStart")
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .bind();

        robot(elt)
            .mousedown()
            .mousemove()
            .mouseup();

        expect(ctx.commands).toHaveLength(1);
    });

    test("that 'strictStart' works correctly when the 'when' routine returns false", () => {
        const binding = bindings.dndBinder(false)
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .when((_i: SrcTgtPointsData<PointData>) => false, "strictStart")
            .bind();

        robot(elt)
            .mousedown()
            .mousemove()
            .mouseup();

        expect(ctx.commands).toHaveLength(0);
        expect(binding.interaction.isRunning()).toBeFalsy();
    });

    test("that 'strictStart' stops the interaction", () => {
        const binding = bindings.dndBinder(false)
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .when((_i: SrcTgtPointsData<PointData>) => false, "strictStart")
            .bind();

        robot(elt)
            .mousedown()
            .mousemove();

        expect(binding.interaction.isRunning()).toBeFalsy();
    });

    test("that 'when' is not called on the first event of a DnD", () => {
        const when = jest.fn().mockReturnValue(false);
        bindings.dndBinder(false)
            .on(elt)
            .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
            .when(() => false, "strictStart")
            .bind();

        robot(elt).mousedown();

        expect(when).not.toHaveBeenCalled();
    });

    describe("check when it crashes in routines", () => {
        let baseBinder: InteractionCmdUpdateBinder<StubCmd, Interaction<SrcTgtPointsData<TouchData>>, unknown>;
        let err: Error;
        let cmd: StubCmd;

        beforeEach(() => {
            err = new Error("It crashed");
            cmd = new StubCmd(true);
            baseBinder = bindings.touchDnDBinder(false)
                .on(elt)
                .toProduce((_i: SrcTgtPointsData<TouchData>) => cmd);
        });

        test("when it crashes in 'first' with an error", () => {
            baseBinder
                .first((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 3, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", err);
        });

        test("when it crashes in 'first' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            baseBinder
                .first((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .catch(fn)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when 'catch' crashes, logged", () => {
            baseBinder
                .first(() => {
                    throw err;
                })
                .catch(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", err);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'catch'", err);
        });

        test("when 'catch' crashes with not an error, logged", () => {
            baseBinder
                .first(() => {
                    throw err;
                })
                .catch(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "YOLO";
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", err);
        });

        test("when it crashes in 'first' with not an error", () => {
            baseBinder
                .first((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw 42;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", 42);
        });

        test("when it crashes in 'then' with an error", () => {
            baseBinder
                .then((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'then'", err);
        });

        test("when it crashes in 'then' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            baseBinder
                .then(() => {
                    throw err;
                })
                .catch(fn)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(2);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'then' with not an error", () => {
            baseBinder
                .then((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "foo";
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'then'", "foo");
        });

        test("when it crashes in 'end' with an error", () => {
            baseBinder
                .end((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'end'", err);
        });

        test("when it crashes in 'end' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            baseBinder
                .end(() => {
                    throw err;
                })
                .catch(fn)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'end' with not an error", () => {
            baseBinder
                .end(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw 21;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'end'", 21);
        });

        test("when it crashes in 'endOrCancel' with an error", () => {
            baseBinder
                .endOrCancel((_i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'endOrCancel'", err);
        });

        test("when it crashes in 'endOrCancel' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            baseBinder
                .catch(fn)
                .endOrCancel(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'endOrCancel' with not an error", () => {
            baseBinder
                .endOrCancel((_i: SrcTgtPointsData<TouchData>) => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw true;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'endOrCancel'", true);
        });

        test("when it crashes in 'cancel' with an error", () => {
            bindings.dndBinder(true)
                .on(elt)
                .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
                .cancel((_i: SrcTgtPointsData<PointData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .mousedown()
                .mousemove()
                .keydown({"code": "Escape"});

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'cancel'", err);
        });

        test("when it crashes in 'cancel' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            bindings.dndBinder(true)
                .toProduce(() => new StubCmd(true))
                .on(elt)
                .catch(fn)
                .cancel(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .mousedown()
                .mousemove()
                .keydown({"code": "Escape"});

            expect(ctx.commands).toHaveLength(0);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'cancel' with not an error", () => {
            bindings.dndBinder(true)
                .on(elt)
                .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
                .cancel(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "bar";
                })
                .bind();

            robot(elt)
                .mousedown()
                .mousemove()
                .keydown({"code": "Escape"});

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'cancel'", "bar");
        });

        test("when it crashes in 'ifHadNoEffect' with an error", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
            baseBinder
                .ifHadNoEffect((_c, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", err);
        });

        test("when it crashes in 'ifHadNoEffect' with an error caught by 'catch'", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
            const fn = jest.fn();
            baseBinder
                .catch(fn)
                .ifHadNoEffect(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'ifHadNoEffect' with not an error", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
            baseBinder
                .ifHadNoEffect(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw 11;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", 11);
        });

        test("when it crashes in 'ifHadEffect' with an error", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
            baseBinder
                .ifHadEffects((_c, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadEffects'", err);
        });

        test("when it crashes in 'ifHadEffect' with an error caught by 'catch'", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
            const fn = jest.fn();
            baseBinder
                .catch(fn)
                .ifHadEffects(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'ifHadEffect' with not an error", () => {
            jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
            baseBinder
                .ifHadEffects(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "YOLO";
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(1);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifHadEffects'", "YOLO");
        });

        test("when it crashes in 'when' with an error", () => {
            baseBinder
                .when((_i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in checking condition", err);
        });

        test("when it crashes in 'when' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            baseBinder
                .catch(fn)
                .when(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(fn).toHaveBeenCalledTimes(3);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'when' with not an error", () => {
            baseBinder
                .when(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "msg";
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove();

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in checking condition", "msg");
        });

        test("call to 'when' should log", () => {
            baseBinder
                .log("binding")
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove();

            expect(logger.logBindingMsg).toHaveBeenNthCalledWith(1, "Checking condition: true");
        });

        test("when it crashes in 'ifCannotExecute' with an error", () => {
            cmd = new StubCmd(false);
            baseBinder
                .ifCannotExecute((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", err);
        });

        test("when it crashes in 'ifCannotExecute' with an error caught by 'catch'", () => {
            const fn = jest.fn();
            cmd = new StubCmd(false);
            baseBinder
                .catch(fn)
                .ifCannotExecute(() => {
                    throw err;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(fn).toHaveBeenCalledTimes(1);
            expect(fn).toHaveBeenCalledWith(err);
        });

        test("when it crashes in 'ifCannotExecute' with not an error", () => {
            cmd = new StubCmd(false);
            baseBinder
                .ifCannotExecute(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw 1;
                })
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1, "target": elt}])
                .touchmove()
                .touchend();

            expect(ctx.commands).toHaveLength(0);
            expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", 1);
        });
    });

    describe("tap and longPress conflict", () => {
        let binding: Binding<Command, Interaction<InteractionData>, unknown>;
        let binding2: Binding<Command, Interaction<InteractionData>, unknown>;

        beforeEach(() => {
            binding2 = bindings.longTouchBinder(50)
                .on(elt)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .bind();
            binding = bindings.tapBinder(1)
                .toProduce((_i: TapsData) => new StubCmd(true))
                .on(elt)
                .bind();
        });

        test("touchstart and wait", () => {
            robot(elt)
                .touchstart({}, [{"identifier": 1}])
                .runOnlyPendingTimers();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
        });

        test("touchstart and touchend", () => {
            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .touchend();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(0);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
        });
    });

    describe("two longTouch", () => {
        let binding: Binding<Command, Interaction<InteractionData>, unknown>;
        let binding2: Binding<Command, Interaction<InteractionData>, unknown>;

        test("two longTouch stopImmediatePropagation", () => {
            binding2 = bindings.longTouchBinder(10)
                .on(elt)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .stopImmediatePropagation()
                .bind();
            binding = bindings.longTouchBinder(500)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .runOnlyPendingTimers()
                .touchend();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
        });

        test("two longTouch std", () => {
            binding2 = bindings.longTouchBinder(10)
                .on(elt)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .bind();
            binding = bindings.longTouchBinder(500)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .runOnlyPendingTimers()
                .touchend();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
        });

        test("two longTouch std 2", () => {
            binding2 = bindings.longTouchBinder(500)
                .on(elt)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .stopImmediatePropagation()
                .bind();
            binding = bindings.longTouchBinder(10)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .on(elt)
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .runOnlyPendingTimers()
                .touchend();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
        });

        test("two longTouch std 3", () => {
            binding2 = bindings.longTouchBinder(500)
                .on(elt)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .bind();
            binding = bindings.longTouchBinder(10)
                .toProduce((_i: TouchData) => new StubCmd(true))
                .on(elt)
                .stopImmediatePropagation()
                .bind();

            robot(elt)
                .keepData()
                .touchstart({}, [{"identifier": 1}])
                .runOnlyPendingTimers()
                .touchend();
            expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
            expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
        });

        describe("strict modes", () => {
            let cmd: StubCmd;
            let undoCmd: StubUndoableCmd;

            beforeEach(() => {
                cmd = new StubCmd(true, true);
                undoCmd = new StubUndoableCmd(true);
                jest.spyOn(cmd, "cancel");
                jest.spyOn(undoCmd, "cancel");
                jest.spyOn(undoCmd, "undo");
            });

            test("start strict", () => {
                binding = bindings.longMouseDownBinder(100)
                    .toProduce(() => undoCmd)
                    .when(() => false, "strictStart")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown();

                expect(binding.interaction.isRunning()).toBeFalsy();
                expect(binding.command).toBeUndefined();
            });

            test("then lazy", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "then")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove();
                expect(binding.command).toBeUndefined();
            });

            test("then lazy false, and then lazy true", () => {
                let ok = false;
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => ok, "then")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove();
                ok = true;

                robot(elt)
                    .mousemove();

                expect(binding.command).toBe(undoCmd);
                expect(undoCmd.getStatus()).toBe("created");
            });

            test("then lazy false, and end true", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "then")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();
                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(1);
                expect(undoCmd.getStatus()).toBe("done");
            });

            test("end false", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "end")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();
                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(1);
                expect(undoCmd.getStatus()).toBe("cancelled");
            });

            test("several ends", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "end")
                    .when(() => true, "end")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(1);
            });

            test("one end true", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => true, "end")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(1);
                expect(binding.timesCancelled).toBe(0);
                expect(undoCmd.getStatus()).toBe("done");
            });

            test("strict then false", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "strictThen")
                    .when(() => true, "end")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(1);
            });

            test("strict false", () => {
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => false, "strict")
                    .when(() => true, "end")
                    .when(() => true, "then")
                    .when(() => true, "nonStrict")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove()
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(0);
            });

            test("start ok but then false with strict", () => {
                let ok = true;
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => ok, "strict")
                    .when(() => true, "end")
                    .when(() => true, "then")
                    .when(() => true, "nonStrict")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove();

                ok = false;
                robot(elt)
                    .mousemove()
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(1);
            });

            test("start ok but end false with strict", () => {
                let ok = true;
                binding = bindings.dndBinder(true)
                    .toProduce(() => undoCmd)
                    .when(() => ok, "strict")
                    .when(() => true, "end")
                    .when(() => true, "then")
                    .on(elt)
                    .bind();

                robot(elt)
                    .keepData()
                    .mousedown()
                    .mousemove();

                ok = false;
                robot(elt)
                    .mouseup();

                expect(binding.command).toBeUndefined();
                expect(binding.timesEnded).toBe(0);
                expect(binding.timesCancelled).toBe(1);
            });
        });
    });

    describe("combine works", () => {
        test("with two interactions", () => {
            bindings
                .combine([new Click(logger), new KeyTyped(logger)])
                .on(elt)
                .toProduce((_i: ThenData<Array<KeyData | PointData>>) => new StubCmd(true))
                .bind();

            robot(elt)
                .click()
                .keydown()
                .keyup();

            expect(ctx.commands).toHaveLength(1);
        });
    });
});
