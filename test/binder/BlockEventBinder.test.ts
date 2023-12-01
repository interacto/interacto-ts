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
import {BindingsImpl, MouseDown, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createKeyEvent, createMouseEvent} from "../interaction/StubEvents";
import {mock} from "jest-mock-extended";
import type {Bindings} from "../../src/api/binding/Bindings";
import type {Binding, UndoHistoryBase, Logger} from "../../src/interacto";
import type {Subscription} from "rxjs";

let canvas1: HTMLElement;
let canvas2: HTMLElement;
let binding1: Binding<StubCmd, MouseDown, unknown>;
let binding2: Binding<StubCmd, MouseDown, unknown>;
let disposable: Subscription | undefined;
let bindings: Bindings<UndoHistoryBase>;

describe("using a block event binder", () => {
    beforeEach(() => {
        bindings = new BindingsImpl(new UndoHistoryImpl());
        document.documentElement.innerHTML = "<html><div><canvas id='c1'> <canvas id='c2'/> </canvas></html>";
        canvas1 = document.querySelector("#c1") as HTMLElement;
        canvas2 = document.querySelector("#c2") as HTMLElement;
    });

    afterEach(() => {
        disposable?.unsubscribe();
        binding1.uninstallBinding();
        binding2.uninstallBinding();
        bindings.clear();
    });

    test("event bubbling works", () => {
        binding2 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(_i => new StubCmd())
            .on(canvas2)
            .bind();

        binding1 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(_i => new StubCmd())
            .on(canvas1)
            .bind();

        canvas2.dispatchEvent(createMouseEvent("mousedown", canvas2));

        expect(binding2.timesEnded).toBe(1);
        expect(binding1.timesEnded).toBe(1);
    });

    test("event bubbling respects physical laws", () => {
        binding2 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => new StubCmd())
            .on(canvas2)
            .bind();

        binding1 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => new StubCmd())
            .on(canvas1)
            .bind();

        canvas1.dispatchEvent(createMouseEvent("mousedown", canvas1));

        expect(binding1.timesEnded).toBe(1);
        expect(binding2.timesEnded).toBe(0);
    });

    test("stop propagation prevents bubbling", () => {
        binding2 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => new StubCmd())
            .on(canvas2)
            .stopImmediatePropagation()
            .bind();

        binding1 = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => new StubCmd())
            .on(canvas1)
            .bind();

        canvas2.dispatchEvent(createMouseEvent("mousedown", canvas2));

        expect(binding2.timesEnded).toBe(1);
        expect(binding1.timesEnded).toBe(0);
    });

    test("stop propagation prevents bubbling with key bindings", () => {
        const b2 = bindings.keyDownBinder(false)
            .toProduce(() => new StubCmd())
            .on(canvas2)
            .stopImmediatePropagation()
            .bind();

        const b1 = bindings.keyDownBinder(false)
            .toProduce(() => new StubCmd())
            .on(canvas1)
            .bind();

        canvas2.dispatchEvent(createKeyEvent("keydown", "A"));

        expect(b2.timesEnded).toBe(1);
        expect(b1.timesEnded).toBe(0);
    });

    test("stop propagation prevents bubbling using cloned builders", () => {
        const clone = bindings.nodeBinder()
            .usingInteraction(() => new MouseDown(mock<Logger>()))
            .toProduce(() => new StubCmd())
            .stopImmediatePropagation();

        binding1 = clone
            .on(canvas1)
            .bind();

        binding2 = clone
            .on(canvas2)
            .bind();

        canvas2.dispatchEvent(createMouseEvent("mousedown", canvas2));

        expect(binding2.timesEnded).toBe(1);
        expect(binding1.timesEnded).toBe(0);
    });
});
