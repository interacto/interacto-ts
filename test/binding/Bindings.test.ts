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
    clickBinder,
    CommandsRegistry,
    dbleClickBinder, dndBinder, dragLockBinder,
    EventRegistrationToken, keyPressBinder, keyTypeBinder,
    pressBinder,
    UndoCollector
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {Subscription} from "rxjs";
import {createKeyEvent, createMouseEvent} from "../interaction/StubEvents";

let elt: HTMLElement;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    document.documentElement.innerHTML = "<html><div id='div'></div></html>";
    const elt1 = document.getElementById("div");
    if (elt1 !== null) {
        elt = elt1;
    }
    producedCmds = [];
});

afterEach(() => {
    disposable.unsubscribe();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("press binder", () => {
    const binding = pressBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt));
    expect(producedCmds).toHaveLength(1);
});

test("click binder", () => {
    const binding = clickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    expect(producedCmds).toHaveLength(1);
});

test("double click binder", () => {
    const binding = dbleClickBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    elt.dispatchEvent(createMouseEvent(EventRegistrationToken.click, elt));
    expect(producedCmds).toHaveLength(1);
});

test("drag lock binder", () => {
    const binding = dragLockBinder()
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
    const binding = dndBinder(false, false)
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
    const binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key type binder", () => {
    const binding = keyTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "A"));
    expect(producedCmds).toHaveLength(1);
});
