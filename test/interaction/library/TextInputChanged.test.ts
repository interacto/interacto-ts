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

import type {FSMHandler, Logger} from "../../../src/interacto";
import {TextInputChanged} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {robot} from "interacto-nono";

jest.useFakeTimers();

let interaction: TextInputChanged;
let textArea: HTMLElement;
let handler: FSMHandler;
let logger: Logger & MockProxy<Logger>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    logger = mock<Logger>();
    interaction = new TextInputChanged(logger);
    interaction.fsm.addHandler(handler);
    textArea = document.createElement("textarea");
});

test("type in a text area starts and stops the interaction", () => {
    interaction.registerToNodes([textArea]);
    robot(textArea).input();
    jest.runOnlyPendingTimers();
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("log interaction is ok", () => {
    interaction.log(true);
    interaction.registerToNodes([textArea]);
    robot(textArea).input();
    jest.runOnlyPendingTimers();

    expect(logger.logInteractionMsg).toHaveBeenCalledTimes(7);
});

test("no log interaction is ok", () => {
    interaction.registerToNodes([textArea]);
    robot(textArea).input();
    jest.runOnlyPendingTimers();

    expect(logger.logInteractionMsg).not.toHaveBeenCalled();
});

test("spinner contains an img on which user clicks", () => {
    const img = document.createElement("img");
    textArea.append(img);
    interaction.registerToNodes([textArea]);

    robot(img).input();

    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});
