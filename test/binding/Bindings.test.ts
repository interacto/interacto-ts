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
    clickBinder, Command,
    CommandsRegistry,
    dbleClickBinder,
    dndBinder,
    dragLockBinder,
    EventRegistrationToken,
    FSM,
    InteractionData,
    InteractionImpl,
    keyPressBinder,
    keyTypeBinder,
    LogLevel,
    PointData,
    pressBinder,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {Subscription} from "rxjs";
import {createKeyEvent, createMouseEvent} from "../interaction/StubEvents";

let elt: HTMLElement;
let producedCmds: Array<Command>;
let disposable: Subscription;
let binding: WidgetBinding<Command, InteractionImpl<InteractionData, FSM>, InteractionData>;

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
    binding = dndBinder(false, false)
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
