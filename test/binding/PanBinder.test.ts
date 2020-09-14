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
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";
import {
    CommandsRegistry,
    EventRegistrationToken,
    Pan,
    panBinder,
    SrcTgtTouchData,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";

let binding: WidgetBinding<StubCmd, Pan, SrcTgtTouchData> | undefined;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;
let c1: HTMLElement;

beforeEach(() => {
    jest.useFakeTimers();
    producedCmds = [];
    document.documentElement.innerHTML = "<html><div><canvas id='c1'/></html>";
    c1 = document.getElementById("c1") as HTMLElement;
});

afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    disposable?.unsubscribe();
    binding?.uninstallBinding();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("pan horizontal right", () => {
    binding = panBinder(true, 50, 5)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, c1, 15, 20, 150, 200));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, c1, 16, 21, 160, 201));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, c1, 20, 25, 200, 205));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 3, c1, 20, 25, 200, 205));

    expect(binding).toBeDefined();
    expect(binding.getTimesCancelled()).toStrictEqual(0);
    expect(binding.getTimesEnded()).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBeInstanceOf(StubCmd);
});

test("pan horizontal left", () => {
    binding = panBinder(true, 50, 5)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, c1, 15, 20, 150, 200));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, c1, 14, 19, 140, 199));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, c1, 10, 15, 100, 195));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 3, c1, 10, 15, 100, 195));

    expect(binding).toBeDefined();
    expect(binding.getTimesCancelled()).toStrictEqual(0);
    expect(binding.getTimesEnded()).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBeInstanceOf(StubCmd);
});


test("pan vertical up", () => {
    binding = panBinder(false, 10, 0)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, c1, 10, 20, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, c1, 10, 25, 110, 233));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, c1, 10, 30, 110, 240));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, c1, 10, 30, 110, 240));

    expect(binding).toBeDefined();
    expect(binding.getTimesCancelled()).toStrictEqual(0);
    expect(binding.getTimesEnded()).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBeInstanceOf(StubCmd);
});

test("pan vertical down", () => {
    binding = panBinder(false, 100, 1)
        .toProduce(() => new StubCmd(true))
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, c1, 10, 200, 110, 2300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, c1, 10, 250, 110, 2330));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 1, c1, 11, 300, 111, 2400));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, c1, 11, 300, 111, 2400));

    expect(binding).toBeDefined();
    expect(binding.getTimesCancelled()).toStrictEqual(0);
    expect(binding.getTimesEnded()).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBeInstanceOf(StubCmd);
});
