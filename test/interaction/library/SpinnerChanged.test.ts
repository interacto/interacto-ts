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

import type {FSMHandler} from "../../../src/interacto";
import {SpinnerChanged, SpinnerChangedFSM} from "../../../src/interacto";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

let interaction: SpinnerChanged;
let spinner: HTMLInputElement;
let handler: FSMHandler;
let timer: number;

beforeEach(() => {
    jest.useFakeTimers();
    handler = mock<FSMHandler>();
    interaction = new SpinnerChanged();
    interaction.log(true);
    interaction.fsm.log = true;
    interaction.fsm.addHandler(handler);
    timer = SpinnerChangedFSM.getTimeGap();
    spinner = document.createElement("input");
    spinner.type = "number";
});

afterEach(() => {
    SpinnerChangedFSM.setTimeGap(timer);
});

test("build fsm twice does not work", () => {
    const count = interaction.fsm.states.length;
    interaction.fsm.buildFSM({
        initToChangedHandler(): void {
        }, reinitData(): void {
        }
    });
    expect(interaction.fsm.states).toHaveLength(count);
});

test("testSpinnerChangedGoodState", () => {
    interaction.registerToNodes([spinner]);
    robot(spinner).input();
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testSpinnerChange2TimesGoodState", () => {
    interaction.registerToNodes([spinner]);
    robot(spinner)
        .input()
        .input();
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("testSpinnerChangedGoodStateWithTimeGap", () => {
    SpinnerChangedFSM.setTimeGap(50);
    interaction.registerToNodes([spinner]);
    robot(spinner).input();
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testSpinnerChangeTwoTimesWith500GoodState", () => {
    interaction.registerToNodes([spinner]);
    robot(spinner)
        .input()
        .do(() => jest.runAllTimers())
        .input();
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("testNoActionWhenNotRegistered", () => {
    robot(spinner).input();
    jest.runAllTimers();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("spinner Registered twice", () => {
    interaction.registerToNodes([spinner, spinner]);
    robot(spinner).input();
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("cannot register non spinner", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "addEventListener");
    interaction.onNewNodeRegistered(w);
    expect(w.addEventListener).not.toHaveBeenCalled();
});

test("cannot unregister non spinner", () => {
    const w = document.createElement("input");
    jest.spyOn(w, "removeEventListener");
    interaction.onNodeUnregistered(w);
    expect(w.removeEventListener).not.toHaveBeenCalled();
});
