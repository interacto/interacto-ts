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
import {Binding} from "../../src/api/binding/Binding";
import {InteractionData} from "../../src/api/interaction/InteractionData";
import {keyPressBinder, keysTypeBinder} from "../../src/api/binding/Bindings";
import {StubCmd} from "../command/StubCmd";
import {createKeyEvent} from "../interaction/StubEvents";
import {UndoHistory} from "../../src/impl/undo/UndoHistory";
import {CommandsRegistry} from "../../src/impl/command/CommandsRegistry";
import {Interaction} from "../../src/api/interaction/Interaction";
import {mock} from "jest-mock-extended";
import {BindingsObserver} from "../../src/api/binding/BindingsObserver";
import {KeysBinder} from "../../src/impl/binder/KeysBinder";
import {KeyPressed} from "../../src/impl/interaction/library/KeyPressed";
import {KeysData} from "../../src/api/interaction/KeysData";

let elt: HTMLElement;
let producedCmds: Array<Command>;
let disposable: Subscription | undefined;
let binding: Binding<Command, Interaction<InteractionData>, InteractionData> | undefined;

beforeEach(() => {
    jest.useFakeTimers();
    elt = document.createElement("canvas");
    producedCmds = [];
});

afterEach(() => {
    binding?.uninstallBinding();
    disposable?.unsubscribe();
    CommandsRegistry.getInstance().clear();
    UndoHistory.getInstance().clear();
});


test("that is crashes when calling bind without an interaction supplier", () => {
    expect(() => new KeysBinder().bind()).toThrow("The interaction supplier cannot be undefined here");
});

test("that is crashes when calling bind without a command supplier", () => {
    const binder = new KeysBinder().usingInteraction(() => mock<Interaction<InteractionData>>());
    expect(() => binder.bind()).toThrow("The command supplier cannot be undefined here");
});

test("that observer is used on bind", () => {
    const obs = mock<BindingsObserver>();
    const binder = new KeysBinder(obs)
        .usingInteraction(() => new KeyPressed(false))
        .toProduce(() => mock<Command>());

    binding = binder.bind();
    expect(obs.observeBinding).toHaveBeenCalledTimes(1);
    expect(obs.observeBinding).toHaveBeenCalledWith(binding);
});

test("key press std key", () => {
    binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key press std key when false", () => {
    binding = keyPressBinder(false)
        .when(_i => false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(producedCmds).toHaveLength(0);
});

test("key press std key when true", () => {
    binding = keyPressBinder(false)
        .when(i => i.getKey() === "A")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "A"));
    expect(producedCmds).toHaveLength(1);
});

test("key press modifier KO", () => {
    binding = keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    const key = createKeyEvent("keydown", "Shift");
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
    const key = createKeyEvent("keydown", "Shift");
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "c"));
    expect(producedCmds).toHaveLength(1);
});

test("key press with routine KO 1", () => {
    binding = keyPressBinder(false)
        .with("c")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "d"));
    expect(producedCmds).toHaveLength(0);
});

test("key press with routine KO several keys", () => {
    binding = keyPressBinder(false)
        .with("d", "e")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "d"));
    expect(producedCmds).toHaveLength(0);
});

test("key press with routine OK modifier", () => {
    binding = keyPressBinder(true)
        .with("Alt")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    const key = createKeyEvent("keydown", "Alt");
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
    elt.dispatchEvent(createKeyEvent("keydown", "f"));
    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
});

test("keys type std keys", () => {
    binding = keysTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));
    elt.dispatchEvent(createKeyEvent("keydown", "a"));
    elt.dispatchEvent(createKeyEvent("keyup", "a"));
    elt.dispatchEvent(createKeyEvent("keydown", "x"));
    elt.dispatchEvent(createKeyEvent("keyup", "x"));
    elt.dispatchEvent(createKeyEvent("keydown", "y"));
    elt.dispatchEvent(createKeyEvent("keyup", "y"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
    elt.dispatchEvent(createKeyEvent("keydown", "y"));
    elt.dispatchEvent(createKeyEvent("keyup", "y"));
    elt.dispatchEvent(createKeyEvent("keydown", "r"));
    elt.dispatchEvent(createKeyEvent("keyup", "r"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "a"));
    elt.dispatchEvent(createKeyEvent("keyup", "a"));
    elt.dispatchEvent(createKeyEvent("keydown", "x"));
    elt.dispatchEvent(createKeyEvent("keyup", "x"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "a"));
    elt.dispatchEvent(createKeyEvent("keyup", "a"));
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "z"));
    elt.dispatchEvent(createKeyEvent("keyup", "z"));
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
    elt.dispatchEvent(createKeyEvent("keydown", "z"));
    elt.dispatchEvent(createKeyEvent("keyup", "z"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
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
    elt.dispatchEvent(createKeyEvent("keydown", "z"));
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "z"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
    jest.runOnlyPendingTimers();
    expect(producedCmds).toHaveLength(1);
});

test("that 'strictStart' works correctly when no 'when' routine with key binder", () => {
    binding = keysTypeBinder()
        .strictStart()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createKeyEvent("keydown", "c"));
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "c"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
    jest.runOnlyPendingTimers();

    expect(producedCmds).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns false", () => {
    binding = keysTypeBinder()
        .on(elt)
        .strictStart()
        .toProduce((_i: KeysData) => new StubCmd(true))
        .when((_i: KeysData) => false)
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createKeyEvent("keydown", "g"));
    elt.dispatchEvent(createKeyEvent("keydown", "y"));
    elt.dispatchEvent(createKeyEvent("keyup", "g"));
    elt.dispatchEvent(createKeyEvent("keyup", "y"));
    jest.runOnlyPendingTimers();

    expect(producedCmds).toHaveLength(0);
    expect(binding.getInteraction().isRunning()).toBeFalsy();
});

test("that 'strictStart' works correctly when the 'when' routine returns true", () => {
    binding = keysTypeBinder()
        .when((_i: KeysData) => true)
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .strictStart()
        .bind();

    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    elt.dispatchEvent(createKeyEvent("keydown", "g"));
    elt.dispatchEvent(createKeyEvent("keydown", "y"));
    elt.dispatchEvent(createKeyEvent("keyup", "g"));
    elt.dispatchEvent(createKeyEvent("keyup", "y"));
    jest.runOnlyPendingTimers();

    expect(producedCmds).toHaveLength(1);
});
