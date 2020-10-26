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
    AnonCmd, catBinder,
    clickBinder,
    Command,
    CommandsRegistry,
    dbleClickBinder,
    dndBinder,
    dragLockBinder,
    EventRegistrationToken, hyperlinkBinder,
    Interaction, InteractionCmdUpdateBinder,
    InteractionData,
    keyPressBinder, KeysData, keysPressBinder,
    keyTypeBinder,
    LogLevel,
    longTouchBinder,
    PointData,
    pressBinder, scrollBinder, ScrollData,
    SrcTgtTouchData, swipeBinder,
    tapBinder,
    TapData,
    TouchData,
    touchDnDBinder,
    UndoCollector,
    WidgetBinding, WidgetData
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {Subscription} from "rxjs";
import {createKeyEvent, createMouseEvent, createTouchEvent, createUIEvent} from "../interaction/StubEvents";

let elt: HTMLElement;
let producedCmds: Array<Command>;
let disposable: Subscription;
let binding: WidgetBinding<Command, Interaction<InteractionData>, InteractionData>;

beforeEach(() => {
    jest.useFakeTimers();

    document.documentElement.innerHTML = "<html><div id='div'></div></html>";
    const elt1 = document.getElementById("div");
    if (elt1 !== null) {
        elt = elt1;
    }
    producedCmds = [];
});

afterEach(() => {
    binding.uninstallBinding();
    disposable.unsubscribe();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    jest.clearAllTimers();
});

test("press binder", () => {
    binding = pressBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt));
    expect(producedCmds).toHaveLength(1);
});

test("click binder", () => {
    binding = clickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    expect(producedCmds).toHaveLength(1);
});

test("double click binder", () => {
    binding = dbleClickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    expect(producedCmds).toHaveLength(1);
});

test("drag lock binder", () => {
    binding = dragLockBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    expect(producedCmds).toHaveLength(1);
});

test("dnd binder", () => {
    binding = dndBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseUp, elt));
    expect(producedCmds).toHaveLength(1);
});

test("key press binder", () => {
    binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key type binder", () => {
    binding = keyTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "A"));
    expect(producedCmds).toHaveLength(1);
});

test("click must not block drag lock", () => {
    binding = dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .when(i => i.getButton() === 2)
        .log(LogLevel.interaction)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt, 1, 2, 3, 4, 1));
    jest.runOnlyPendingTimers();
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));

    expect(producedCmds).toHaveLength(1);
});

test("drag lock: double click does not cancel", () => {
    binding = dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .log(LogLevel.interaction)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt, 1, 2, 3, 4, 0));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt, 1, 2, 3, 4, 0));

    expect(binding.getInteraction().isRunning()).toBeTruthy();
});

test("drag lock: first then end", () => {
    const first = jest.fn();
    const end = jest.fn();
    const then = jest.fn();
    const endcancel = jest.fn();
    binding = dragLockBinder()
        .on(elt)
        .toProduce((_i: PointData) => new StubCmd(true))
        .end(end)
        .endOrCancel(endcancel)
        .first(first)
        .then(then)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt, 1, 2, 3, 4, 1));
    jest.runOnlyPendingTimers();
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.auxclick, elt, 1, 2, 3, 4, 2));

    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledTimes(4);
    expect(endcancel).toHaveBeenCalledTimes(1);
});


test("binding with anon command", () => {
    binding = clickBinder()
        .on(elt)
        .toProduce((_i: PointData) => new AnonCmd(() => {
        }))
        .log(LogLevel.interaction)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt, 1, 2, 3, 4, 0));

    expect(producedCmds).toHaveLength(1);
});

test("touch DnD binding", () => {
    binding = touchDnDBinder()
        .on(elt)
        .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

    expect(producedCmds).toHaveLength(1);
});

test("that hyperlink binder works", () => {
    document.documentElement.innerHTML = "<html><div><a id='url' href=''>Foo</a> </div></html>";
    const url = document.getElementById("url") as HTMLElement;

    binding = hyperlinkBinder()
        .toProduce((_i: WidgetData<HTMLAnchorElement>) => new StubCmd(true))
        .on(url)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    url.dispatchEvent(new Event("input"));

    expect(producedCmds).toHaveLength(1);
});

test("that swipe binder works", () => {
    binding = swipeBinder(true, 400, 200, 10)
        .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
        .on(elt)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, elt,
        50, 20, 100, 200, 5000));
    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 2, elt,
        170, 30, 161, 202, 5500));
    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 2, elt,
        450, 30, 500, 210, 6000));
    elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 2, elt,
        450, 30, 500, 210, 6000));

    expect(producedCmds).toHaveLength(1);
});

test("that scroll binder works", () => {
    binding = scrollBinder()
        .on(elt)
        .toProduce((_i: ScrollData) => new StubCmd(true))
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createUIEvent("scroll"));

    expect(producedCmds).toHaveLength(1);
});

test("that keysPress binder works", () => {
    binding = keysPressBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "B"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "B"));

    expect(producedCmds).toHaveLength(1);
});


test("that 'ifCannotExecute' is correctly called", () => {
    const mockFn = jest.fn();
    const cmd = new StubCmd(false);
    binding = pressBinder()
        .on(elt)
        .toProduce((_i: SrcTgtTouchData) => cmd)
        .ifCannotExecute(mockFn)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt, 11, 23, 110, 230));

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(producedCmds).toHaveLength(0);
    expect(producedCmds).toHaveLength(0);
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
        binding = baseBinder
            .first((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'first'", err);
    });

    test("when it crashes in 'then'", () => {
        binding = baseBinder
            .then((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'then'", err);
    });

    test("when it crashes in 'end'", () => {
        binding = baseBinder
            .end((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'end'", err);
    });

    test("when it crashes in 'endOrCancel'", () => {
        binding = baseBinder
            .endOrCancel((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'endOrCancel'", err);
    });

    test("when it crashes in 'cancel'", () => {
        binding = dndBinder(true)
            .on(elt)
            .toProduce((_i: SrcTgtTouchData) => new StubCmd(true))
            .cancel((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt));
        elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseMove, elt));
        elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "Escape"));

        expect(producedCmds).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'cancel'", err);
    });

    test("when it crashes in 'ifHadNoEffect'", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(false);
        binding = baseBinder
            .ifHadNoEffect((_c, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifHadNoEffect'", err);
    });

    test("when it crashes in 'ifHadEffect'", () => {
        jest.spyOn(cmd, "hadEffect").mockReturnValue(true);
        binding = baseBinder
            .ifHadEffects((_c, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(1);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifHadEffects'", err);
    });

    test("when it crashes in 'when'", () => {
        binding = baseBinder
            .when((_i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'when'", err);
    });

    test("when it crashes in 'ifCannotExecute'", () => {
        cmd = new StubCmd(false);
        binding = baseBinder
            .ifCannotExecute((_c: StubCmd, _i: SrcTgtTouchData) => {
                throw err;
            })
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));

        expect(producedCmds).toHaveLength(0);
        expect(catBinder.error).toHaveBeenCalledWith("Crash in 'ifCannotExecute'", err);
    });
});


describe("tap and longPress conflict", () => {
    let producedCmds2: Array<Command>;
    let disposable2: Subscription;
    let binding2: WidgetBinding<Command, Interaction<InteractionData>, InteractionData>;

    beforeEach(() => {
        producedCmds2 = [];
        binding2 = longTouchBinder(50)
            .on(elt)
            .toProduce((_i: TouchData) => new StubCmd(true))
            .bind();
        binding = tapBinder(1)
            .toProduce((_i: TapData) => new StubCmd(true))
            .on(elt)
            .bind();

        disposable = binding.produces().subscribe(c => producedCmds.push(c));
        disposable2 = binding2.produces().subscribe(c => producedCmds2.push(c));
    });

    afterEach(() => {
        binding2.uninstallBinding();
        disposable2.unsubscribe();
    });

    test("touchstart and wait", () => {
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(0);
    });

    test("touchstart and touchend", () => {
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(0);
        expect(producedCmds).toHaveLength(1);
    });

    test("touchstart, wait, touchend", () => {
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(1);
    });
});

describe("two longTouch", () => {
    let producedCmds2: Array<Command>;
    let disposable2: Subscription;
    let binding2: WidgetBinding<Command, Interaction<InteractionData>, InteractionData>;


    beforeEach(() => {
        producedCmds2 = [];
    });

    afterEach(() => {
        binding2.uninstallBinding();
        disposable2.unsubscribe();
    });

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

        disposable = binding.produces().subscribe(c => producedCmds.push(c));
        disposable2 = binding2.produces().subscribe(c => producedCmds2.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(0);
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

        disposable = binding.produces().subscribe(c => producedCmds.push(c));
        disposable2 = binding2.produces().subscribe(c => producedCmds2.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(1);
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

        disposable = binding.produces().subscribe(c => producedCmds.push(c));
        disposable2 = binding2.produces().subscribe(c => producedCmds2.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(0);
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

        disposable = binding.produces().subscribe(c => producedCmds.push(c));
        disposable2 = binding2.produces().subscribe(c => producedCmds2.push(c));

        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, elt, 11, 23, 110, 230));
        jest.runOnlyPendingTimers();
        elt.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, elt, 11, 23, 110, 230));
        expect(producedCmds2).toHaveLength(1);
        expect(producedCmds).toHaveLength(1);
    });
});
