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
import {Subscription} from "rxjs";
import {CommandsRegistry, isSpinner, spinnerBinder, SpinnerChanged, SpinnerChangedFSM, UndoCollector,
    WidgetBinding, WidgetData} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: WidgetBinding<StubCmd, SpinnerChanged, WidgetData<HTMLInputElement>> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    document.documentElement.innerHTML =
        "<html><div><input id='sp1' type='number'>" +
        "<input id='sp2' type='number'>" +
        "</div></html>";
    const elt1 = document.getElementById("sp1");
    if (elt1 !== null && isSpinner(elt1)) {
        widget1 = elt1;
    }
    const elt2 = document.getElementById("sp2");
    if (elt2 !== null && isSpinner(elt2)) {
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
    if (binding !== undefined) {
        binding.uninstallBinding();
    }
});

test("testCommandExecutedOnSingleSpinnerFunction", () => {
    binding = spinnerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(1);
});

test("testCommandExecutedOnTwoSpinners", () => {
    binding = spinnerBinder()
        .on(widget1, widget2)
        .toProduce(_i => new StubCmd(true))
        .bind();
    disposable = binding.produces().subscribe(c => producedCmds.push(c));

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    widget2.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(binding).toBeDefined();
    expect(producedCmds).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = spinnerBinder()
        .on(widget1)
        .toProduce(_i => cmd)
        .first(c => {
            c.exec = 10;
        })
        .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(11);
});

test("testCheckFalse", () => {
    binding = spinnerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .when(_i => false)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(binding).toBeDefined();
    expect(cmd.exec).toStrictEqual(0);
});

test("testEndsOnThen", () => {
    let cpt = 0;

    binding = spinnerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .then(c => {
            // checking that its compiles
            c.exec = 10;
            cpt++;
        })
        .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cmd.exec).toStrictEqual(11);
    expect(cpt).toStrictEqual(2);
});

test("testContinuousThen", () => {
    let cpt = 0;

    binding = spinnerBinder()
        .toProduce(_i => cmd)
        .on(widget1)
        .then(_c => cpt++)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cpt).toStrictEqual(5);
});

test("testContinuousThenTimeOut", () => {
    let cpt1 = 0;
    let cpt2 = 0;

    SpinnerChangedFSM.setTimeGap(2000);

    binding = spinnerBinder()
        .toProduce(_i => new StubCmd(true))
        .on(widget1)
        .first(_c => cpt1++)
        .end(_c => cpt2++)
        .bind();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    widget1.dispatchEvent(new Event("input"));
    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(cpt1).toStrictEqual(2);
    expect(cpt2).toStrictEqual(2);
});
