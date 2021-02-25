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

import type {
    Binding,
    Command,
    EltRef,
    Interaction,
    InteractionCmdUpdateBinder,
    InteractionData,
    KeysData,
    PointData,
    PointsData,
    ScrollData,
    SrcTgtPointsData,
    TapData,
    TouchData,
    WidgetData
} from "../../src/interacto";
import {
    AnonCmd,
    catBinding,
    catCommand,
    clearBindingObserver,
    clickBinder,
    clicksBinder,
    dbleClickBinder,
    dndBinder,
    dragLockBinder,
    hyperlinkBinder,
    keyPressBinder,
    keysPressBinder,
    keyTypeBinder,
    LogLevel,
    longPressBinder,
    longTouchBinder,
    pressBinder,
    scrollBinder,
    setBindingObserver,
    swipeBinder,
    tapBinder,
    touchDnDBinder,
    UndoHistory,
    undoRedoBinder
} from "../../src/interacto";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import type {MouseEventForTest} from "../interaction/StubEvents";
import {createMouseEvent, robot} from "../interaction/StubEvents";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import {flushPromises} from "../Utils";

let elt: HTMLElement;
let ctx: BindingsContext;

beforeEach(() => {
    ctx = new BindingsContext();
    setBindingObserver(ctx);
    jest.useFakeTimers();
    elt = document.createElement("div");
});

afterEach(() => {
    clearBindingObserver();
    UndoHistory.getInstance().clear();
    jest.clearAllTimers();
    jest.clearAllMocks();
});

test("press binder", () => {
    pressBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).mousedown();
    expect(ctx.bindings).toHaveLength(1);
    expect(ctx.commands).toHaveLength(1);
});

test("log cmd binding", () => {
    jest.spyOn(catCommand, "info");
    jest.spyOn(catBinding, "info");
    pressBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .log(LogLevel.command, LogLevel.binding)
        .bind();
    robot(elt).mousedown();
    expect(catCommand.info).toHaveBeenCalledTimes(4);
    expect(catBinding.info).toHaveBeenCalledTimes(5);
});

test("undoable command registered", () => {
    pressBinder()
        .on(elt)
        .toProduce(() => new StubUndoableCmd(true))
        .bind();
    robot(elt).mousedown();
    expect(UndoHistory.getInstance().getLastUndo()).toBeDefined();
});

test("undo redo binders on undo", () => {
    const undo = document.createElement("button");
    const redo = document.createElement("button");
    pressBinder()
        .on(elt)
        .toProduce(() => new StubUndoableCmd(true))
        .bind();
    const bindings = undoRedoBinder(undo, redo);
    robot()
        .mousedown(elt)
        .click(undo);

    expect(UndoHistory.getInstance().getLastRedo()).toBeDefined();
    expect(UndoHistory.getInstance().getLastUndo()).toBeUndefined();
    expect(ctx.getCmdsProducedBy(bindings[0])).toHaveLength(1);
});

test("undo redo binders on redo", () => {
    const undo = document.createElement("button");
    const redo = document.createElement("button");
    pressBinder()
        .on(elt)
        .toProduce(() => new StubUndoableCmd(true))
        .bind();
    const bindings = undoRedoBinder(undo, redo);

    robot()
        .mousedown(elt)
        .click(undo)
        .click(redo);
    expect(UndoHistory.getInstance().getLastRedo()).toBeUndefined();
    expect(UndoHistory.getInstance().getLastUndo()).toBeDefined();
    expect(ctx.getCmdsProducedBy(bindings[1])).toHaveLength(1);
});

test("press binder with ElementRef", () => {
    const eltRef: EltRef<EventTarget> = {
        "nativeElement": elt
    };
    pressBinder()
        .on(eltRef)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot().mousedown(elt);
    expect(ctx.commands).toHaveLength(1);
});

test("click binder", () => {
    clickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot().click(elt);
    expect(ctx.commands).toHaveLength(1);
});

test("double click binder", () => {
    dbleClickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .click()
        .click();
    expect(ctx.commands).toHaveLength(1);
});

test("drag lock binder", () => {
    dragLockBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .click()
        .click()
        .mousemove()
        .click()
        .click();
    expect(ctx.commands).toHaveLength(1);
});

test("dnd binder", () => {
    dndBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .mousedown()
        .mousemove()
        .mouseup();
    expect(ctx.commands).toHaveLength(1);
});

test("dnd binder with throttling", async () => {
    const fsm = dndBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .throttle(20)
        .bind()
        .getInteraction()
        .getFsm();
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
    await flushPromises();

    expect(ctx.commands).toHaveLength(1);
    expect(fsm.process).toHaveBeenNthCalledWith(1, evt1);
    expect(fsm.process).toHaveBeenNthCalledWith(2, evt2);
    expect(fsm.process).toHaveBeenNthCalledWith(3, evt6);
    expect(fsm.process).toHaveBeenNthCalledWith(4, evt7);
    expect(fsm.process).toHaveBeenCalledTimes(4);
});

test("key press binder", () => {
    keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "A"});
    expect(ctx.commands).toHaveLength(1);
});

test("key type binder", () => {
    keyTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "A"})
        .keyup({"code": "A"});
    expect(ctx.commands).toHaveLength(1);
});

test("click must not block drag lock", () => {
    dragLockBinder()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .when(i => i.src.button === 2 && i.tgt.button === 2)
        .log(LogLevel.interaction)
        .bind();

    robot(elt)
        .click({"button": 1})
        .do(() => jest.runOnlyPendingTimers())
        .auxclick({"button": 2})
        .auxclick({"button": 2})
        .mousemove()
        .mousemove()
        .auxclick({"button": 2})
        .auxclick({"button": 2});

    expect(ctx.commands).toHaveLength(1);
});

test("drag lock: double click does not cancel", () => {
    const binding = dragLockBinder()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .log(LogLevel.interaction)
        .bind();

    robot(elt)
        .click({"button": 0})
        .click({"button": 0});

    expect(binding.getInteraction().isRunning()).toBeTruthy();
});

test("drag lock: first then end", () => {
    const first = jest.fn();
    const end = jest.fn();
    const then = jest.fn();
    const endcancel = jest.fn();
    dragLockBinder()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .end(end)
        .endOrCancel(endcancel)
        .first(first)
        .then(then)
        .bind();

    robot(elt)
        .click({"button": 1})
        .do(() => jest.runOnlyPendingTimers())
        .auxclick({"button": 2})
        .auxclick({"button": 2})
        .mousemove()
        .mousemove()
        .auxclick({"button": 2})
        .auxclick({"button": 2});

    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledTimes(4);
    expect(endcancel).toHaveBeenCalledTimes(1);
});


test("binding with anon command", () => {
    clickBinder()
        .on(elt)
        .toProduce((_i: PointData) => new AnonCmd(() => {
        }))
        .log(LogLevel.interaction)
        .bind();

    robot(elt).click();

    expect(ctx.commands).toHaveLength(1);
});

test("touch DnD binding", () => {
    touchDnDBinder()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<TouchData>) => new StubCmd(true))
        .bind();

    robot(elt)
        .touchstart({}, [{"identifier": 1, "target": elt}])
        .touchmove({}, [{"identifier": 1, "target": elt}])
        .touchend({}, [{"identifier": 1, "target": elt}]);

    expect(ctx.commands).toHaveLength(1);
});

test("clicks binding work", () => {
    clicksBinder(3)
        .on(elt)
        .when(_i => true)
        .toProduce((_i: PointsData) => new StubCmd(true))
        .then((_c, _i) => {
        })
        .bind();

    robot(elt)
        .click()
        .click()
        .click();

    expect(ctx.commands).toHaveLength(1);
});

test("longpress binding work", () => {
    longPressBinder(500)
        .on(elt)
        .when(_i => true)
        .toProduce((_i: PointData) => new StubCmd(true))
        .then((_c, _i) => {
        })
        .first((_c, _i) => {
        })
        .bind();

    robot(elt).mousedown();
    jest.runAllTimers();

    expect(ctx.commands).toHaveLength(1);
});

test("that hyperlink binder works", () => {
    const url = document.createElement("a");

    hyperlinkBinder()
        .toProduce((_i: WidgetData<HTMLAnchorElement>) => new StubCmd(true))
        .on(url)
        .bind();

    robot(url).input();

    expect(ctx.commands).toHaveLength(1);
});

test("that swipe binder works", () => {
    swipeBinder(true, 400, 200, 10)
        .toProduce((_i: SrcTgtPointsData<TouchData>) => new StubCmd(true))
        .on(elt)
        .bind();

    robot(elt)
        .touchstart({},
            [{"screenX": 50, "screenY": 20, "clientX": 100, "clientY": 200, "identifier": 2, "target": elt}], 5000)
        .touchmove({},
            [{"screenX": 170, "screenY": 30, "clientX": 161, "clientY": 202, "identifier": 2, "target": elt}], 5500)
        .touchmove({},
            [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210, "identifier": 2, "target": elt}], 6000)
        .touchend({},
            [{"screenX": 450, "screenY": 30, "clientX": 500, "clientY": 210, "identifier": 2, "target": elt}], 6000);

    expect(ctx.commands).toHaveLength(1);
});

test("that scroll binder works", () => {
    scrollBinder()
        .on(elt)
        .toProduce((_i: ScrollData) => new StubCmd(true))
        .bind();

    robot(elt).scroll();

    expect(ctx.commands).toHaveLength(1);
});

test("that keysPress binder works", () => {
    keysPressBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    robot(elt)
        .keydown({"code": "A"})
        .keydown({"code": "B"})
        .keyup({"code": "B"});

    expect(ctx.commands).toHaveLength(1);
});


test("that 'ifCannotExecute' is correctly called", () => {
    const mockFn = jest.fn();
    const cmd = new StubCmd(false);
    pressBinder()
        .on(elt)
        .toProduce((_i: PointData) => cmd)
        .ifCannotExecute(mockFn)
        .bind();

    robot(elt).mousedown();

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(ctx.commands).toHaveLength(0);
});


test("that 'strictStart' works correctly when no 'when' routine", () => {
    dndBinder(false)
        .strictStart()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .bind();

    robot(elt)
        .mousedown()
        .mousemove()
        .mouseup();

    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns true", () => {
    dndBinder(false)
        .when((_i: SrcTgtPointsData<PointData>) => true)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .strictStart()
        .bind();

    robot(elt)
        .mousedown()
        .mousemove()
        .mouseup();

    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns false", () => {
    const binding = dndBinder(false)
        .on(elt)
        .strictStart()
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .when((_i: SrcTgtPointsData<PointData>) => false)
        .bind();

    robot(elt)
        .mousedown()
        .mousemove()
        .mouseup();

    expect(ctx.commands).toHaveLength(0);
    expect(binding.getInteraction().isRunning()).toBeFalsy();
});

test("that 'strictStart' stops the interaction", () => {
    const binding = dndBinder(false)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .when((_i: SrcTgtPointsData<PointData>) => false)
        .strictStart()
        .bind();

    robot(elt)
        .mousedown()
        .mousemove();

    expect(binding.getInteraction().isRunning()).toBeFalsy();
});

test("that 'when' is not called on the first event of a DnD", () => {
    const when = jest.fn().mockReturnValue(false);
    dndBinder(false)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData<PointData>) => new StubCmd(true))
        .when(() => false)
        .strictStart()
        .bind();

    robot(elt).mousedown();

    expect(when).not.toHaveBeenCalled();
});

describe("check when it crashes in routines", () => {
    let baseBinder: InteractionCmdUpdateBinder<StubCmd, Interaction<SrcTgtPointsData<TouchData>>, SrcTgtPointsData<TouchData>>;
    let err: Error;
    let cmd: StubCmd;

    beforeEach(() => {
        jest.spyOn(catBinding, "error");
        jest.spyOn(catBinding, "warn");
        jest.spyOn(catBinding, "info");
        err = new Error("It crashed");
        cmd = new StubCmd(true);
        baseBinder = touchDnDBinder()
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
            .touchstart({}, [{"identifier": 3, "target": elt}])
            .touchmove({}, [{"identifier": 3, "target": elt}])
            .touchend({}, [{"identifier": 3, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'first'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'first'", err);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'catch'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'first'", err);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'catch': YOLO");
    });

    test("when it crashes in 'first' with not an error", () => {
        baseBinder
            .first((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw 42;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'first': 42");
    });

    test("when it crashes in 'then' with an error", () => {
        baseBinder
            .then((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'then'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(fn).toHaveBeenCalledTimes(3);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'then': foo");
    });

    test("when it crashes in 'end' with an error", () => {
        baseBinder
            .end((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'end'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'end': 21");
    });

    test("when it crashes in 'endOrCancel' with an error", () => {
        baseBinder
            .endOrCancel((_i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'endOrCancel'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'endOrCancel': true");
    });

    test("when it crashes in 'cancel' with an error", () => {
        dndBinder(true)
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
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'cancel'", err);
    });

    test("when it crashes in 'cancel' with an error caught by 'catch'", () => {
        const fn = jest.fn();
        dndBinder(true)
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
        dndBinder(true)
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
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'cancel': bar");
    });

    test("when it crashes in 'ifHadNoEffect' with an error", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
        baseBinder
            .ifHadNoEffect((_c, _i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'ifHadNoEffect': 11");
    });

    test("when it crashes in 'ifHadEffect' with an error", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
        baseBinder
            .ifHadEffects((_c, _i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'ifHadEffects'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(1);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'ifHadEffects': YOLO");
    });

    test("when it crashes in 'when' with an error", () => {
        baseBinder
            .when((_i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(0);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'when'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(fn).toHaveBeenCalledTimes(4);
        expect(fn).toHaveBeenCalledWith(err);
    });

    test("when it crashes in 'when' with not an error", () => {
        baseBinder
            .when(() => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "msg";
            })
            .bind();

        robot(elt).touchstart({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(0);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'when': msg");
    });

    test("call to 'when' should log", () => {
        baseBinder
            .log(LogLevel.binding)
            .bind();

        robot(elt).touchstart({}, [{"identifier": 1, "target": elt}]);

        expect(catBinding.info).toHaveBeenNthCalledWith(1, "Checking condition: true");
    });

    test("when it crashes in 'ifCannotExecute' with an error", () => {
        cmd = new StubCmd(false);
        baseBinder
            .ifCannotExecute((_c: StubCmd, _i: SrcTgtPointsData<TouchData>) => {
                throw err;
            })
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(0);
        expect(catBinding.error).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", err);
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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

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
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchmove({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);

        expect(ctx.commands).toHaveLength(0);
        expect(catBinding.warn).toHaveBeenCalledWith("Crash in 'ifCannotExecute': 1");
    });
});


describe("tap and longPress conflict", () => {
    let binding: Binding<Command, Interaction<InteractionData>, InteractionData>;
    let binding2: Binding<Command, Interaction<InteractionData>, InteractionData>;

    beforeEach(() => {
        binding2 = longTouchBinder(50)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .bind();
        binding = tapBinder(1)
            .toProduce((_i: TapData) => new StubCmd(true))
            .on(elt)
            .bind();
    });

    test("touchstart and wait", () => {
        robot(elt).touchstart({}, [{"identifier": 1, "target": elt}]);
        jest.runOnlyPendingTimers();
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
    });

    test("touchstart and touchend", () => {
        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(0);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });

    test("touchstart, wait, touchend", () => {
        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .do(() => jest.runOnlyPendingTimers())
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });
});

describe("two longTouch", () => {
    let binding: Binding<Command, Interaction<InteractionData>, InteractionData>;
    let binding2: Binding<Command, Interaction<InteractionData>, InteractionData>;

    test("two longTouch stopImmediatePropagation", () => {
        binding2 = longTouchBinder(10)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .stopImmediatePropagation()
            .bind();
        binding = longTouchBinder(500)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .do(() => jest.runOnlyPendingTimers())
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
    });

    test("two longTouch std", () => {
        binding2 = longTouchBinder(10)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .bind();
        binding = longTouchBinder(500)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .do(() => jest.runOnlyPendingTimers())
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });

    test("two longTouch std 2", () => {
        binding2 = longTouchBinder(500)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .stopImmediatePropagation()
            .bind();
        binding = longTouchBinder(10)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .on(elt)
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .do(() => jest.runOnlyPendingTimers())
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
    });

    test("two longTouch std 3", () => {
        binding2 = longTouchBinder(500)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .bind();
        binding = longTouchBinder(10)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .on(elt)
            .stopImmediatePropagation()
            .bind();

        robot(elt)
            .touchstart({}, [{"identifier": 1, "target": elt}])
            .do(() => jest.runOnlyPendingTimers())
            .touchend({}, [{"identifier": 1, "target": elt}]);
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });
});
