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

import {SpinnerChanged, SpinnerChangedFSM} from "../../../src/interacto";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSMHandler, Logger} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

describe("using a spinner changed interaction", () => {
    let interaction: SpinnerChanged;
    let spinner: HTMLInputElement;
    let handler: FSMHandler;
    let timer: number;
    let logger: Logger & MockProxy<Logger>;

    beforeEach(() => {
        jest.useFakeTimers();
        handler = mock<FSMHandler>();
        logger = mock<Logger>();
        interaction = new SpinnerChanged(logger);
        interaction.fsm.addHandler(handler);
        timer = SpinnerChangedFSM.getTimeGap();
        spinner = document.createElement("input");
        spinner.type = "number";
    });

    afterEach(() => {
        SpinnerChangedFSM.setTimeGap(timer);
    });

    test("spinnerChangedGoodState", () => {
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("log interaction is ok", () => {
        interaction.log(true);
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();

        expect(logger.logInteractionMsg).toHaveBeenCalledTimes(7);
    });

    test("no log interaction is ok", () => {
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();

        expect(logger.logInteractionMsg).not.toHaveBeenCalled();
    });

    test("spinnerChange2TimesGoodState", () => {
        interaction.registerToNodes([spinner]);
        robot(spinner)
            .input()
            .input();
        jest.runAllTimers();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(2);
    });

    test("spinnerChangedGoodStateWithTimeGap", () => {
        SpinnerChangedFSM.setTimeGap(50);
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    });

    test("spinnerChangeTwoTimesWith500GoodState", () => {
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

    test("noActionWhenNotRegistered", () => {
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

    test("spinner contains an img on which user clicks", () => {
        const img = document.createElement("img");
        spinner.append(img);
        interaction.registerToNodes([spinner]);

        robot(img).input();

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    });

    test("data ok", () => {
        let data;
        interaction.fsm.addHandler({
            "fsmStops": () => {
                data = interaction.data.widget;
            }
        });
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();

        expect(data).toBe(spinner);
    });

    test("data clear ok", () => {
        interaction.registerToNodes([spinner]);
        robot(spinner).input();
        jest.runAllTimers();

        expect(handler.fsmReinit).toHaveBeenCalledTimes(1);
        expect(interaction.data.widget).toBeNull();
    });
});
