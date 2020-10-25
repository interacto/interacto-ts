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
    clickBinder,
    Command,
    CommandsRegistry,
    dbleClickBinder,
    dndBinder,
    dragLockBinder,
    EventRegistrationToken,
    FSM,
    Interaction,
    InteractionData,
    keyPressBinder,
    keyTypeBinder,
    LogLevel,
    longTouchBinder,
    PointData,
    pressBinder,
    SrcTgtTouchData,
    tapBinder,
    TapData,
    TouchData,
    touchDnDBinder,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {Subscription} from "rxjs";
import {createKeyEvent, createMouseEvent, createTouchEvent} from "../interaction/StubEvents";

let elt: HTMLElement;
let producedCmds: Array<Command>;
let disposable: Subscription;
let binding: WidgetBinding<Command, Interaction<InteractionData, FSM>, InteractionData>;

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


describe("tap and longPress conflict", () => {
    let producedCmds2: Array<Command>;
    let disposable2: Subscription;
    let binding2: WidgetBinding<Command, Interaction<InteractionData, FSM>, InteractionData>;

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
    let binding2: WidgetBinding<Command, Interaction<InteractionData, FSM>, InteractionData>;


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
