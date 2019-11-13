/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */
import { WidgetData, WidgetBinding, CommandsRegistry, UndoCollector, spinnerBinder, SpinnerChanged, SpinnerChangedFSM } from "../../src";
import { StubCmd } from "../command/StubCmd";
import { Subscription } from "rxjs";

let widget1: HTMLElement;
let widget2: HTMLElement;
let binding: WidgetBinding<StubCmd, SpinnerChanged, WidgetData<HTMLInputElement>>;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription;

beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    document.documentElement.innerHTML =
        "<html><div><input id='sp1' type='number'>" +
        "<input id='sp2' type='number'>" +
        "</div></html>";
    const elt1 = document.getElementById("sp1");
    if (elt1 !== null) {
        widget1 = elt1;
    }
    const elt2 = document.getElementById("sp2");
    if (elt2 !== null) {
        widget2 = elt2;
    }
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    if (disposable !== undefined) {
        disposable.unsubscribe();
    }
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

test("testCommandExecutedOnSingleSpinnerFunction", () => {
    binding = spinnerBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(1);
});

test("testCommandExecutedOnTwoSpinners", () => {
    binding = spinnerBinder()
                .on(widget1, widget2)
                .toProduce(i => new StubCmd(true))
                .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    widget2.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(binding).not.toBeNull();
    expect(producedCmds.length).toEqual(2);
});

test("testInit1Executed", () => {
    binding = spinnerBinder()
                .on(widget1)
                .toProduce(i => cmd)
                .first(c => c.exec = 10)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(11);
});

test("testCheckFalse", () => {
    binding = spinnerBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .when(i => false)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(binding).not.toBeNull();
    expect(cmd.exec).toEqual(0);
});

test("testEndsOnThen", () => {
    let cpt = 0;

    binding = spinnerBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .then(c => {
                    // checking that its compiles
                    c.exec = 10;
                    cpt++;
                })
                .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cmd.exec).toEqual(11);
    expect(cpt).toEqual(2);
});

test("testContinuousThen", () => {
    let cpt = 0;

    binding = spinnerBinder()
                .toProduce(i => cmd)
                .on(widget1)
                .then(c => cpt++)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cpt).toEqual(5);
});

test("testContinuousThenTimeOut", () => {
    let cpt1 = 0;
    let cpt2 = 0;

    SpinnerChangedFSM.setTimeGap(2000);

    binding = spinnerBinder()
                .toProduce(i => new StubCmd(true))
                .on(widget1)
                .first(c => cpt1++)
                .end(c => cpt2++)
                .bind();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cpt1).toEqual(2);
    expect(cpt2).toEqual(2);
});
