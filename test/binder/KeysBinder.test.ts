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

import type {Command} from "../../src/api/command/Command";
import type {Binding} from "../../src/api/binding/Binding";
import type {InteractionData} from "../../src/api/interaction/InteractionData";
import {BindingsImpl} from "../../src/impl/binding/BindingsImpl";
import {StubCmd} from "../command/StubCmd";
import {createKeyEvent, robot} from "../interaction/StubEvents";
import type {Interaction} from "../../src/api/interaction/Interaction";
import {mock} from "jest-mock-extended";
import type {BindingsObserver} from "../../src/api/binding/BindingsObserver";
import {KeysBinder} from "../../src/impl/binder/KeysBinder";
import {KeyPressed} from "../../src/impl/interaction/library/KeyPressed";
import type {KeysData} from "../../src/api/interaction/KeysData";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Logger} from "../../src/api/logging/Logger";
import type {EltRef} from "../../src/api/binder/BaseBinderBuilder";
import {LogLevel} from "../../src/api/logging/LogLevel";
import clearAllTimers = jest.clearAllTimers;

let elt: HTMLElement;
let binding: Binding<Command, Interaction<InteractionData>, InteractionData> | undefined;
let ctx: BindingsContext;
let bindings: Bindings;

beforeEach(() => {
    bindings = new BindingsImpl();
    ctx = new BindingsContext();
    bindings.setBindingObserver(ctx);
    jest.useFakeTimers();
    elt = document.createElement("canvas");
});

afterEach(() => {
    bindings.clear();
    clearAllTimers();
});


test("that is crashes when calling bind without an interaction supplier", () => {
    expect(() => new KeysBinder(bindings.undoHistory, mock<Logger>()).bind()).toThrow("The interaction supplier cannot be undefined here");
});

test("that is crashes when calling bind without a command supplier", () => {
    const binder = new KeysBinder(bindings.undoHistory, mock<Logger>()).usingInteraction(() => mock<Interaction<InteractionData>>());
    expect(() => binder.bind()).toThrow("The command supplier cannot be undefined here");
});

test("that observer is used on bind", () => {
    const obs = mock<BindingsObserver>();
    const binder = new KeysBinder(bindings.undoHistory, mock<Logger>(), obs)
        .usingInteraction(() => new KeyPressed(false))
        .toProduce(() => mock<Command>());

    binding = binder.bind();
    expect(obs.observeBinding).toHaveBeenCalledTimes(1);
    expect(obs.observeBinding).toHaveBeenCalledWith(binding);
});

test("key press std key", () => {
    binding = bindings.keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "A"});
    expect(ctx.commands).toHaveLength(1);
});

test("key press std key when false", () => {
    binding = bindings.keyPressBinder(false)
        .when(_i => false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "A"});
    expect(ctx.commands).toHaveLength(0);
});

test("key press std key when true", () => {
    binding = bindings.keyPressBinder(false)
        .when(i => i.code === "A")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "A"});
    expect(ctx.commands).toHaveLength(1);
});

test("key press modifier KO", () => {
    binding = bindings.keyPressBinder(false)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    const key = createKeyEvent("keydown", "Shift");
    jest.spyOn(key, "shiftKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(ctx.commands).toHaveLength(0);
});

test("key press modifier OK", () => {
    binding = bindings.keyPressBinder(true)
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    const key = createKeyEvent("keydown", "Shift");
    jest.spyOn(key, "shiftKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(ctx.commands).toHaveLength(1);
});

test("key press with routine OK", () => {
    binding = bindings.keyPressBinder(false)
        .with(true, "b")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "b"});
    expect(ctx.commands).toHaveLength(1);
});

test("key press std key with when false", () => {
    binding = bindings.keyPressBinder(false)
        .with(true, "b")
        .on(elt)
        .when(_i => false)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "b"});
    expect(ctx.commands).toHaveLength(0);
});

test("key press std key with when true", () => {
    binding = bindings.keyPressBinder(false)
        .toProduce(() => new StubCmd(true))
        .on(elt)
        .with(true, "c")
        .when(i => i.code === "c")
        .bind();
    robot(elt).keydown({"code": "c"});
    expect(ctx.commands).toHaveLength(1);
});

test("key press with routine KO 1", () => {
    binding = bindings.keyPressBinder(false)
        .with(true, "c")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "d"});
    expect(ctx.commands).toHaveLength(0);
});

test("key press with routine KO several keys", () => {
    binding = bindings.keyPressBinder(false)
        .with(true, "d", "e")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt).keydown({"code": "d"});
    expect(ctx.commands).toHaveLength(0);
});

test("key press with routine OK modifier", () => {
    binding = bindings.keyPressBinder(true)
        .with(true, "Alt")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    const key = createKeyEvent("keydown", "Alt");
    jest.spyOn(key, "altKey", "get").mockReturnValue(true);
    elt.dispatchEvent(key);
    expect(ctx.commands).toHaveLength(1);
});

test("key press first then end", () => {
    const first = jest.fn();
    const end = jest.fn();
    binding = bindings.keyPressBinder(false)
        .with(true, "f")
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .first(first)
        .end(end)
        .bind();
    robot(elt).keydown({"code": "f"});
    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
});

test("keys type std keys", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "a"})
        .keyup({"code": "a"})
        .keydown({"code": "x"})
        .keyup({"code": "x"})
        .keydown({"code": "y"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("keys type first end", () => {
    const first = jest.fn();
    const end = jest.fn();
    const then = jest.fn();
    const endcancel = jest.fn();
    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce(() => new StubCmd(true))
        .end(end)
        .endOrCancel(endcancel)
        .first(first)
        .then(then)
        .bind();

    robot(elt)
        .keydown({"code": "b"})
        .keyup({"code": "b"})
        .keydown({"code": "y"})
        .keyup({"code": "y"})
        .keydown({"code": "r"})
        .keyup({"code": "r"});
    jest.runOnlyPendingTimers();
    expect(first).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    expect(then).toHaveBeenCalledTimes(4);
    expect(endcancel).toHaveBeenCalledTimes(1);
});

test("keys type with 1", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "a", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "a"})
        .keyup({"code": "a"})
        .keydown({"code": "x"})
        .keyup({"code": "x"});
    elt.dispatchEvent(createKeyEvent("keydown", "a"));
    elt.dispatchEvent(createKeyEvent("keyup", "a"));
    elt.dispatchEvent(createKeyEvent("keydown", "x"));
    elt.dispatchEvent(createKeyEvent("keyup", "x"));
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(0);
});

test("keys type with 2", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "a")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "a"})
        .keyup({"code": "a"})
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    elt.dispatchEvent(createKeyEvent("keydown", "a"));
    elt.dispatchEvent(createKeyEvent("keyup", "a"));
    elt.dispatchEvent(createKeyEvent("keydown", "b"));
    elt.dispatchEvent(createKeyEvent("keyup", "b"));
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(0);
});

test("keys type with 3", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "z"})
        .keyup({"code": "z"})
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("keys type with 4", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "b"})
        .keyup({"code": "b"})
        .keydown({"code": "z"})
        .keyup({"code": "z"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("keys type with nothing", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true)
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("keys type with 5", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("keys type with 3 mixed keydown up", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .with(true, "z", "b")
        .toProduce(() => new StubCmd(true))
        .bind();
    robot(elt)
        .keydown({"code": "z"})
        .keydown({"code": "b"})
        .keyup({"code": "z"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();
    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when no 'when' routine with key binder", () => {
    binding = bindings.keysTypeBinder()
        .strictStart()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    robot(elt)
        .keydown({"code": "c"})
        .keydown({"code": "b"})
        .keyup({"code": "c"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();

    expect(ctx.commands).toHaveLength(1);
});

test("that 'strictStart' works correctly when the 'when' routine returns false", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .strictStart()
        .toProduce((_i: KeysData) => new StubCmd(true))
        .when((_i: KeysData) => false)
        .bind();

    robot(elt)
        .keydown({"code": "g"})
        .keydown({"code": "y"})
        .keyup({"code": "g"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(ctx.commands).toHaveLength(0);
    expect(binding.interaction.isRunning()).toBeFalsy();
});

test("that 'strictStart' works correctly when the 'when' routine returns true", () => {
    binding = bindings.keysTypeBinder()
        .when((_i: KeysData) => true)
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .strictStart()
        .bind();

    robot(elt)
        .keydown({"code": "g"})
        .keydown({"code": "y"})
        .keyup({"code": "g"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(ctx.commands).toHaveLength(1);
});

test("set name", () => {
    binding = bindings.keysTypeBinder()
        .name("yolo")
        .when((_i: KeysData) => true)
        .name("aName")
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    expect(binding).toBeDefined();
    expect(binding.name).toBe("aName");
});

test("set no name", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    expect(binding).toBeDefined();
    expect(binding.name).toBe("KeysTyped");
});

test("on dynamic eltRef", async () => {
    const div = document.createElement("div");
    const eltRef: EltRef<HTMLDivElement> = {
        "nativeElement": div
    };
    binding = bindings.keysTypeBinder()
        .toProduce(() => new StubCmd(true))
        .onDynamic(eltRef)
        .bind();

    div.appendChild(elt);
    await Promise.resolve();

    robot(elt)
        .keydown({"code": "b"})
        .keyup({"code": "b"});
    jest.runOnlyPendingTimers();

    expect(binding).toBeDefined();
    expect(ctx.commands).toHaveLength(1);
});

test("on dynamic", async () => {
    const div = document.createElement("div");

    binding = bindings.keysTypeBinder()
        .toProduce(() => new StubCmd(true))
        .onDynamic(div)
        .bind();

    div.appendChild(elt);
    await Promise.resolve();

    robot(elt)
        .keydown({"code": "a"})
        .keyup({"code": "a"});
    jest.runOnlyPendingTimers();

    expect(binding).toBeDefined();
    expect(ctx.commands).toHaveLength(1);
});

test("when it crashes in 'first' with an error caught by 'catch'", () => {
    const fn = jest.fn();
    const err = new Error("It crashed");

    binding = bindings.keysTypeBinder()
        .toProduce(() => new StubCmd(true))
        .first((_c: StubCmd, _i: KeysData) => {
            throw err;
        })
        .on(elt)
        .catch(fn)
        .bind();

    robot(elt)
        .keydown({"code": "a"})
        .keyup({"code": "a"});
    jest.runOnlyPendingTimers();

    expect(ctx.commands).toHaveLength(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(err);
});

test("ifHadEffects works", () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .ifHadEffects(fn1)
        .ifHadNoEffect(fn2)
        .bind();

    robot(elt)
        .keydown({"code": "g"})
        .keydown({"code": "y"})
        .keyup({"code": "g"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();
});

test("ifHadNoEffect works", () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true, false))
        .ifHadEffects(fn1)
        .ifHadNoEffect(fn2)
        .bind();

    robot(elt)
        .keydown({"code": "g"})
        .keydown({"code": "y"})
        .keyup({"code": "g"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
});

test("ifCannotExecute works when cannot execute", () => {
    const fn = jest.fn();

    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(false))
        .ifCannotExecute(fn)
        .bind();

    robot(elt)
        .keydown({"code": "g"})
        .keydown({"code": "y"})
        .keyup({"code": "g"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(fn).toHaveBeenCalledTimes(1);
});

test("ifCannotExecute works when can execute", () => {
    const fn = jest.fn();

    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .ifCannotExecute(fn)
        .bind();

    robot(elt)
        .keydown({"code": "y"})
        .keyup({"code": "y"});
    jest.runOnlyPendingTimers();

    expect(fn).not.toHaveBeenCalled();
});

test("log works", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .toProduce((_i: KeysData) => new StubCmd(true))
        .log(LogLevel.interaction, LogLevel.usage)
        .bind();

    expect(binding.logUsage).toBeTruthy();
    expect(binding.interaction).toBeTruthy();
    expect(binding.command).toBeFalsy();
});

test("preventdefault works", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .preventDefault()
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    expect(binding.interaction.preventDefault).toBeTruthy();
});

test("stopImmediatePropagation works", () => {
    binding = bindings.keysTypeBinder()
        .on(elt)
        .stopImmediatePropagation()
        .toProduce((_i: KeysData) => new StubCmd(true))
        .bind();

    expect(binding.interaction.stopImmediatePropagation).toBeTruthy();
});
