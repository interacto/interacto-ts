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
    Binding,
    catBinder,
    clearBindingObserver,
    clickBinder,
    clicksBinder,
    Command,
    CommandsRegistry,
    dbleClickBinder,
    dndBinder,
    dragLockBinder,
    EltRef,
    hyperlinkBinder,
    Interaction,
    InteractionCmdUpdateBinder,
    InteractionData,
    keyPressBinder,
    KeysData,
    keysPressBinder,
    keyTypeBinder,
    LogLevel,
    longPressBinder,
    longTouchBinder,
    PointData,
    PointsData,
    pressBinder,
    scrollBinder,
    ScrollData,
    setBindingObserver,
    SrcTgtPointsData,
    SrcTgtTouchData,
    swipeBinder,
    tapBinder,
    TapData,
    TouchData,
    touchDnDBinder,
    UndoHistory,
    undoRedoBinder,
    WidgetData
} from "../../src/interacto";
import {StubCmd, StubUndoableCmd} from "../command/StubCmd";
import {createKeyEvent, createMouseEvent, createTouchEvent, createUIEvent} from "../interaction/StubEvents";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";

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
    CommandsRegistry.getInstance().clear();
    UndoHistory.getInstance().clear();
    jest.clearAllTimers();
    jest.clearAllMocks();
});

test("press binder", () => {
    pressBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
    expect(ctx.bindings).toHaveLength(1);
    expect(ctx.commands).toHaveLength(1);
});

test("undoable command registered", () => {
    pressBinder()
        .on(elt)
        .toProduce(() => new StubUndoableCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
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
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
    undo.click();
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
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
    undo.click();
    redo.click();
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
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
    expect(ctx.commands).toHaveLength(1);
});

test("click binder", () => {
    clickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("click", elt));
    expect(ctx.commands).toHaveLength(1);
});

test("double click binder", () => {
    dbleClickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("click", elt));
    elt.dispatchEvent(createMouseEvent("click", elt));
    expect(ctx.commands).toHaveLength(1);
});

test("drag lock binder", () => {
    dragLockBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("click", elt));
    elt.dispatchEvent(createMouseEvent("click", elt));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("click", elt));
    elt.dispatchEvent(createMouseEvent("click", elt));
    expect(ctx.commands).toHaveLength(1);
});

test("dnd binder", () => {
    dndBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createMouseEvent("mousedown", elt));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("mouseup", elt));
    expect(ctx.commands).toHaveLength(1);
});

test("key press binder", () => {
    keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(ctx.commands).toHaveLength(1);
});

test("key type binder", () => {
    keyTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    elt.dispatchEvent(createKeyEvent("keyup", "A"));
    expect(ctx.commands).toHaveLength(1);
});

test("click must not block drag lock", () => {
    dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .when(i => i.getButton() === 2)
        .log(LogLevel.interaction)
        .bind();

    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 1));
    jest.runOnlyPendingTimers();
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));

    expect(ctx.commands).toHaveLength(1);
});

test("drag lock: double click does not cancel", () => {
    const binding = dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .log(LogLevel.interaction)
        .bind();

    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));
    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));

    expect(binding.getInteraction().isRunning()).toBeTruthy();
});

test("drag lock: first then end", () => {
    const first = jest.fn();
    const end = jest.fn();
    const then = jest.fn();
    const endcancel = jest.fn();
    dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .end(end)
        .endOrCancel(endcancel)
        .first(first)
        .then(then)
        .bind();

    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 1));
    jest.runOnlyPendingTimers();
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("mousemove", elt));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent("auxclick", elt, 1, 2, 3, 4, 2));

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

    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));

    expect(ctx.commands).toHaveLength(1);
});

test("touch DnD binding", () => {
    touchDnDBinder()
        .on(elt)
        .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
        .bind();

    elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
    elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
    elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

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

    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));
    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));
    elt.dispatchEvent(createMouseEvent("click", elt, 1, 2, 3, 4, 0));

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

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 1, 2, 3, 4, 0));
    jest.runAllTimers();

    expect(ctx.commands).toHaveLength(1);
});

test("that hyperlink binder works", () => {
    const url = document.createElement("a");

    hyperlinkBinder()
        .toProduce((_i: WidgetData<HTMLAnchorElement>) => new StubCmd(true))
        .on(url)
        .bind();

    url.dispatchEvent(new Event("input"));

    expect(ctx.commands).toHaveLength(1);
});

test("that swipe binder works", () => {
    swipeBinder(true, 400, 200, 10)
        .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
        .on(elt)
        .bind();

    elt.dispatchEvent(createTouchEvent("touchstart", 2, elt,
        50, 20, 100, 200, 5000));
    elt.dispatchEvent(createTouchEvent("touchmove", 2, elt,
        170, 30, 161, 202, 5500));
    elt.dispatchEvent(createTouchEvent("touchmove", 2, elt,
        450, 30, 500, 210, 6000));
    elt.dispatchEvent(createTouchEvent("touchend", 2, elt,
        450, 30, 500, 210, 6000));

    expect(ctx.commands).toHaveLength(1);
});

test("that scroll binder works", () => {
    scrollBinder()
        .on(elt)
        .toProduce((_i: ScrollData) => new StubCmd(true))
        .bind();

    elt.dispatchEvent(createUIEvent("scroll"));

    expect(ctx.commands).toHaveLength(1);
});

test("that keysPress binder works", () => {
    keysPressBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    elt.dispatchEvent(createKeyEvent("keydown", "B"));
    elt.dispatchEvent(createKeyEvent("keyup", "B"));

    expect(ctx.commands).toHaveLength(1);
});


test("that 'ifCannotExecute' is correctly called", () => {
    const mockFn = jest.fn();
    const cmd = new StubCmd(false);
    pressBinder()
        .on(elt)
        .toProduce((_i: SrcTgtTouchData) => cmd)
        .ifCannotExecute(mockFn)
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(ctx.commands).toHaveLength(0);
});


test("that 'strictStart' works correctly when no 'when' routine", () => {
    dndBinder(false)
        .strictStart()
        .on(elt)
        .toProduce((_i: SrcTgtPointsData) => new StubCmd(true))
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));
    elt.dispatchEvent(createMouseEvent("mousemove", elt, 12, 24, 111, 231));
    elt.dispatchEvent(createMouseEvent("mouseup", elt, 12, 24, 111, 231));

    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns true", () => {
    dndBinder(false)
        .when((_i: SrcTgtPointsData) => true)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData) => new StubCmd(true))
        .strictStart()
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));
    elt.dispatchEvent(createMouseEvent("mousemove", elt, 12, 24, 111, 231));
    elt.dispatchEvent(createMouseEvent("mouseup", elt, 12, 24, 111, 231));

    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns false", () => {
    const binding = dndBinder(false)
        .on(elt)
        .strictStart()
        .toProduce((_i: SrcTgtPointsData) => new StubCmd(true))
        .when((_i: SrcTgtPointsData) => false)
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));
    elt.dispatchEvent(createMouseEvent("mousemove", elt, 12, 24, 111, 231));
    elt.dispatchEvent(createMouseEvent("mouseup", elt, 12, 24, 111, 231));

    expect(ctx.commands).toHaveLength(0);
    expect(binding.getInteraction().isRunning()).toBeFalsy();
});

test("that 'strictStart' stops the interaction", () => {
    const binding = dndBinder(false)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData) => new StubCmd(true))
        .when((_i: SrcTgtPointsData) => false)
        .strictStart()
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));
    elt.dispatchEvent(createMouseEvent("mousemove", elt, 12, 24, 111, 231));

    expect(binding.getInteraction().isRunning()).toBeFalsy();
});

test("that 'when' is not called on the first event of a DnD", () => {
    const when = jest.fn().mockReturnValue(false);
    dndBinder(false)
        .on(elt)
        .toProduce((_i: SrcTgtPointsData) => new StubCmd(true))
        .when(() => false)
        .strictStart()
        .bind();

    elt.dispatchEvent(createMouseEvent("mousedown", elt, 11, 23, 110, 230));

    expect(when).not.toHaveBeenCalled();
});

describe("check when it crashes in routines", () => {
    let baseBinder: InteractionCmdUpdateBinder<StubCmd, Interaction<SrcTgtTouchData>, SrcTgtTouchData>;
    let err: Error;
    let cmd: StubCmd;

    beforeEach(() => {
        jest.spyOn(catBinder, "error");
        err = new Error("It crashed");
        cmd = new StubCmd(true);
        baseBinder = touchDnDBinder()
            .on(elt)
            .toProduce((_i: SrcTgtTouchData) => cmd);
    });

    test("when it crashes in 'first'", () => {
        baseBinder
            .first((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'first'", err);
    });

    test("when it crashes in 'then'", () => {
        baseBinder
            .then((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'then'", err);
    });

    test("when it crashes in 'end'", () => {
        baseBinder
            .end((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'end'", err);
    });

    test("when it crashes in 'endOrCancel'", () => {
        baseBinder
            .endOrCancel((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'endOrCancel'", err);
    });

    test("when it crashes in 'cancel'", () => {
        dndBinder(true)
            .on(elt)
            .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
            .cancel((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createMouseEvent("mousedown", elt));
        elt.dispatchEvent(createMouseEvent("mousemove", elt));
        elt.dispatchEvent(createKeyEvent("keydown", "Escape"));

        expect(ctx.commands).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'cancel'", err);
    });

    test("when it crashes in 'ifHadNoEffect'", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
        baseBinder
            .ifHadNoEffect((_c, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", err);
    });

    test("when it crashes in 'ifHadEffect'", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
        baseBinder
            .ifHadEffects((_c, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifHadEffects'", err);
    });

    test("when it crashes in 'when'", () => {
        baseBinder
            .when((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'when'", err);
    });

    test("when it crashes in 'ifCannotExecute'", () => {
        cmd = new StubCmd(false);
        baseBinder
            .ifCannotExecute((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchmove", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));

        expect(ctx.commands).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", err);
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
        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(0);
    });

    test("touchstart and touchend", () => {
        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(0);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });

    test("touchstart, wait, touchend", () => {
        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
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

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
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

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
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

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
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

        elt.dispatchEvent(createTouchEvent("touchstart", 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent("touchend", 1, elt, 11, 23, 110, 230));
        expect(ctx.getCmdsProducedBy(binding2)).toHaveLength(1);
        expect(ctx.getCmdsProducedBy(binding)).toHaveLength(1);
    });
});
