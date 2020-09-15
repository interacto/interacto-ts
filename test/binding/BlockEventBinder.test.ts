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
import {Subscription} from "rxjs";
import {
    CommandsRegistry,
    EventRegistrationToken,
    nodeBinder,
    PointData,
    Press,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createMouseEvent} from "../interaction/StubEvents";

let canvas1: HTMLElement;
let canvas2: HTMLElement;
let binding1: WidgetBinding<StubCmd, Press, PointData>;
let binding2: WidgetBinding<StubCmd, Press, PointData>;
let disposable: Subscription | undefined;

beforeEach(() => {
    document.documentElement.innerHTML = "<html><div><canvas id='c1'> <canvas id='c2'/> </canvas></html>";
    canvas1 = document.getElementById("c1") as HTMLElement;
    canvas2 = document.getElementById("c2") as HTMLElement;
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    binding1.uninstallBinding();
    binding2.uninstallBinding();
});

test("event bubbling works", () => {
    binding2 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(_i => new StubCmd())
        .on(canvas2)
        .bind();

    binding1 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(_i => new StubCmd())
        .on(canvas1)
        .bind();

    canvas2.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas2));

    expect(binding2.getTimesEnded()).toStrictEqual(1);
    expect(binding1.getTimesEnded()).toStrictEqual(1);
});

test("event bubbling respects physical laws", () => {
    binding2 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(() => new StubCmd())
        .on(canvas2)
        .bind();

    binding1 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(() => new StubCmd())
        .on(canvas1)
        .bind();

    canvas1.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas1));

    expect(binding1.getTimesEnded()).toStrictEqual(1);
    expect(binding2.getTimesEnded()).toStrictEqual(0);
});

test("stop propagation prevents bubbling", () => {
    binding2 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(() => new StubCmd())
        .on(canvas2)
        .stopImmediatePropagation()
        .bind();

    binding1 = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(() => new StubCmd())
        .on(canvas1)
        .bind();

    canvas2.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas2));

    expect(binding2.getTimesEnded()).toStrictEqual(1);
    expect(binding1.getTimesEnded()).toStrictEqual(0);
});

test("stop propagation prevents bubbling using cloned builders", () => {
    const clone = nodeBinder()
        .usingInteraction(() => new Press())
        .toProduce(() => new StubCmd())
        .stopImmediatePropagation();

    binding1 = clone
        .on(canvas1)
        .bind();

    binding2 = clone
        .on(canvas2)
        .bind();

    canvas2.dispatchEvent(createMouseEvent(EventRegistrationToken.mouseDown, canvas2));

    expect(binding2.getTimesEnded()).toStrictEqual(1);
    expect(binding1.getTimesEnded()).toStrictEqual(0);
});
