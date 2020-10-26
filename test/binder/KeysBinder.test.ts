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

import {Command} from "../../src/api/command/Command";
import {Subscription} from "rxjs";
import {WidgetBinding} from "../../src/api/binding/WidgetBinding";
import {InteractionData} from "../../src/api/interaction/InteractionData";
import {keyPressBinder, keysTypeBinder} from "../../src/api/binding/Bindings";
import {StubCmd} from "../command/StubCmd";
import {createKeyEvent} from "../interaction/StubEvents";
import {EventRegistrationToken} from "../../src/impl/fsm/Events";
import {UndoCollector} from "../../src/impl/undo/UndoCollector";
import {CommandsRegistry} from "../../src/impl/command/CommandsRegistry";
import {Interaction} from "../../src/api/interaction/Interaction";

let elt: HTMLElement;
let producedCmds: Array<Command>;
let disposable: Subscription;
let binding: WidgetBinding<Command, Interaction<InteractionData>, InteractionData>;

beforeEach(() => {
    jest.useFakeTimers();

    document.documentElement.innerHTML = "<html><canvas id='div'></canvas></html>";
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

test("key press std key", () => {
    binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key press std key when false", () => {
    binding = keyPressBinder(false)
        .when(_i => false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    expect(producedCmds).toHaveLength(0);
});

test("key press std key when true", () => {
    binding = keyPressBinder(false)
        .when(i => i.getKey() === "A")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key press modifier KO", () => {
    binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    const key = createKeyEvent(EventRegistrationToken.keyDown, "Shift");
    jest.spyOn(key, "shiftKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(producedCmds).toHaveLength(0);
});

test("key press modifier OK", () => {
    binding = keyPressBinder(true)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    const key = createKeyEvent(EventRegistrationToken.keyDown, "Shift");
    jest.spyOn(key, "shiftKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(producedCmds).toHaveLength(1);
});

test("key press with routine OK", () => {
    binding = keyPressBinder(false)
        .with("b")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    expect(producedCmds).toHaveLength(1);
});

test("key press std key with when false", () => {
    binding = keyPressBinder(false)
        .with("b")
        .on(elt)
        .when(_i => false)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    expect(producedCmds).toHaveLength(0);
});

test("key press std key with when true", () => {
    binding = keyPressBinder(false)
        .toProduce(() => new StubCmd(true))
        .on(elt)
        .with("c")
        .when(i => i.getKey() === "c")
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "c"));
    expect(producedCmds).toHaveLength(1);
});

test("key press with routine KO 1", () => {
    binding = keyPressBinder(false)
        .with("c")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "d"));
    expect(producedCmds).toHaveLength(0);
});

test("key press with routine KO several keys", () => {
    binding = keyPressBinder(false)
        .with("d", "e")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "d"));
    expect(producedCmds).toHaveLength(0);
});

test("key press with routine OK modifier", () => {
    binding = keyPressBinder(true)
        .with("Alt")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    const key = createKeyEvent(EventRegistrationToken.keyDown, "Alt");
    jest.spyOn(key, "altKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(producedCmds).toHaveLength(1);
});

test("key press first then end", () => {
    const first = jest.fn();
    const end = jest.fn();
    binding = keyPressBinder(false)
        .with("f")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .first(first)
        .end(end)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "f"));
    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
});

test("keys type std keys", () => {
    binding = keysTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "x"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "x"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "y"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "y"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("keys type first end", () => {
    const first = jest.fn();
    const end = jest.fn();
    const then = jest.fn();
    const endcancel = jest.fn();
    binding = keysTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .end(end)
        .endOrCancel(endcancel)
        .first(first)
        .then(then)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "y"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "y"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "r"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "r"));
    jest.runOnlyPendingTimers();
    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledTimes(4);
    expect(endcancel).toHaveBeenCalledTimes(1);
});

test("keys type with 1", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("a", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "x"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "x"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(0);
});

test("keys type with 2", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("a")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "a"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(0);
});

test("keys type with 3", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "z"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "z"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("keys type with 4", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "z"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "z"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("keys type with nothing", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with()
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("keys type with 5", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("b")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("keys type with 3 mixed keydown up", () => {
    binding = keysTypeBinder()
        .on(elt)
        .with("z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "z"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "z"));
    elt.dispatchEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});
