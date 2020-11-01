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
    EventRegistrationToken, FSM,
    Interaction, InteractionBase,
    InteractionData,
    multiTouchBinder,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";

let c1: HTMLElement;
let binding: WidgetBinding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    jest.useFakeTimers();
    c1 = document.createElement("canvas");
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    disposable?.unsubscribe();
    binding?.uninstallBinding();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("run multi-touch produces cmd", () => {
    binding = multiTouchBinder(2)
        .toProduce(() => cmd)
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 2, c1, 15, 30, 150, 300));

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
    expect(producedCmds).toHaveLength(1);
    expect(producedCmds[0]).toBe(cmd);
});


test("run multi-touch two times recycle events", () => {
    const data: Array<number> = [];
    const dataFirst: Array<number> = [];

    binding = multiTouchBinder(2)
        .toProduce(() => new StubCmd(true))
        .first((_, i) => {
            dataFirst.push(i.getTouchData().length);
        })
        .on(c1)
        .end((_, i) => {
            data.push(i.getTouchData().length);
        })
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 2, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 3, c1, 31, 13, 310, 130));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchmove, 3, c1, 15, 30, 150, 300));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchend, 1, c1, 15, 30, 150, 300));

    expect(binding).toBeDefined();
    expect(producedCmds).toHaveLength(2);
    expect(dataFirst).toHaveLength(2);
    expect(dataFirst[0]).toStrictEqual(2);
    expect(dataFirst[1]).toStrictEqual(2);
    expect(data).toHaveLength(2);
    expect(data[0]).toStrictEqual(2);
    expect(data[1]).toStrictEqual(2);
});

test("unsubscribe does not trigger the binding", () => {
    binding = multiTouchBinder(2)
        .toProduce(() => cmd)
        .on(c1)
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    (binding.getInteraction() as InteractionBase<InteractionData, FSM>).onNodeUnregistered(c1);

    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 1, c1, 11, 23, 110, 230));
    c1.dispatchEvent(createTouchEvent(EventRegistrationToken.touchstart, 2, c1, 31, 13, 310, 130));

    expect(binding.isRunning()).toBeFalsy();
});

