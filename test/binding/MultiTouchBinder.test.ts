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
import { Subscription } from "rxjs";
import { CommandsRegistry, EventRegistrationToken, MultiTouch, multiTouchBinder, MultiTouchData,
    MultiTouchDataImpl, UndoCollector, WidgetBinding } from "../../src/interacto";
import { StubCmd } from "../command/StubCmd";
import { createTouchEvent } from "../interaction/StubEvents";

let c1: HTMLElement;
let binding: WidgetBinding<StubCmd, MultiTouch, MultiTouchData>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    jest.useFakeTimers();
    document.documentElement.innerHTML = "<html><div><canvas id='c1'/></html>";
    c1 = document.getElementById("c1") as HTMLElement;
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    binding.uninstallBinding();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
    if(binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("run multi-touch produces cmd", () => {
    binding = multiTouchBinder(2)
        .toProduce(() => cmd)
        .then((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, c1, 15, 30, 150, 300));

    expect(binding).not.toBeNull();
    expect(cmd.exec).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
});


test("run multi-touch two times recycle events", () => {
    binding = multiTouchBinder(2)
        .toProduce(() => new StubCmd(true))
        .first((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .then((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .end((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .endOrCancel(i => {
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 3, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchmove, 3, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchend, 1, c1, 15, 30, 150, 300));

    expect(binding).not.toBeNull();
    expect(producedCmds).toHaveLength(2);
});

test("unsubscribe does not trigger the binding", () => {
    binding = multiTouchBinder(2)
        .toProduce(() => cmd)
        .then((c, i) => {
            expect(c).toBeInstanceOf(StubCmd);
            expect(i).toBeInstanceOf(MultiTouchDataImpl);
        })
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    binding.getInteraction().onNodeUnregistered(c1);

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.Touchstart, 2, c1, 31, 13, 310, 130));

    expect(binding.isRunning()).toBeFalsy();
});

