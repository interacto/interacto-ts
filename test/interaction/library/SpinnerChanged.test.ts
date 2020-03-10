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

import { FSMHandler } from "../../../src/fsm/FSMHandler";
import { StubFSMHandler } from "../../fsm/StubFSMHandler";
import { SpinnerChanged, SpinnerChangedFSM } from "../../../src/interaction/library/SpinnerChanged";

jest.mock("../../fsm/StubFSMHandler");

let interaction: SpinnerChanged;
let spinner: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    handler = new StubFSMHandler();
    interaction = new SpinnerChanged();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><div><input id='sp1' type='number' step='1' value='1'/></div></html>";
    const elt = document.getElementById("sp1");
    if (elt !== null) {
        spinner = elt;
    }
});

test("testSpinnerChangedGoodState", () => {
    interaction.registerToNodes([spinner]);
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testSpinnerChange2TimesGoodState", () => {
    interaction.registerToNodes([spinner]);
    spinner.dispatchEvent(new Event("input"));
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("testSpinnerChangedGoodStateWithTimeGap", () => {
    SpinnerChangedFSM.setTimeGap(50);
    interaction.registerToNodes([spinner]);
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
});

test("testSpinnerChangeTwoTimesWith500GoodState", () => {
    interaction.registerToNodes([spinner]);
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(2);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(2);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
});

test("testNoActionWhenNotRegistered", () => {
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("testUnRegisterNode", () => {
    interaction.registerToNodes([spinner]);
    interaction.unregisterFromNodes([spinner]);
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).not.toHaveBeenCalled();
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});

test("spinner Registered twice", () => {
    interaction.registerToNodes([spinner, spinner]);
    spinner.dispatchEvent(new Event("input"));
    jest.runAllTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
