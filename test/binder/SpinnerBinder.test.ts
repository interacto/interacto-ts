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
import {
    Binding,
    clearBindingObserver,
    CommandsRegistry,
    Interaction,
    InteractionData,
    setBindingObserver,
    spinnerBinder,
    SpinnerChangedFSM,
    UndoHistory,
    WidgetData
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {BindingsContext} from "../../src/impl/binding/BindingsContext";

let widget1: HTMLInputElement;
let widget2: HTMLInputElement;
let binding: Binding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let ctx: BindingsContext;

beforeEach(() => {
    ctx = new BindingsContext();
    setBindingObserver(ctx);
    jest.useFakeTimers();
    widget1 = document.createElement("input");
    widget2 = document.createElement("input");
    widget1.type = "number";
    widget2.type = "number";
    cmd = new StubCmd(true);
});

afterEach(() => {
    jest.clearAllTimers();
    clearBindingObserver();
    CommandsRegistry.getInstance().clear();
    UndoHistory.getInstance().clear();
});

test("testCommandExecutedOnSingleSpinnerFunction", () => {
    binding = spinnerBinder()
        .toProduce((_i: WidgetData<HTMLInputElement>) => cmd)
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
        .toProduce((_i: WidgetData<HTMLInputElement>) => new StubCmd(true))
        .bind();

    widget1.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    widget2.dispatchEvent(new Event("input"));
    jest.runAllTimers();

    expect(binding).toBeDefined();
    expect(ctx.commands).toHaveLength(2);
});

test("testInit1Executed", () => {
    binding = spinnerBinder()
        .on(widget1)
        .toProduce(_i => cmd)
        .first((c: StubCmd) => {
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
        .then((c: StubCmd) => {
            // checking that its compiles
            c.exec = 10;
            cpt++;
        })
        .end(() => {
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
        .toProduce((_i: WidgetData<HTMLInputElement>) => cmd)
        .on(widget1)
        .then((_c, _i) => cpt++)
        .end((_c, _i) => {
        })
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
        .first((_c, _i) => cpt1++)
        .end((_c: StubCmd) => cpt2++)
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
