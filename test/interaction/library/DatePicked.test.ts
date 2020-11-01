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

import {DatePicked, FSMHandler} from "../../../src/interacto";
import {mock} from "jest-mock-extended";

let interaction: DatePicked;
let date: HTMLInputElement;
let handler: FSMHandler;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new DatePicked();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    date = document.createElement("input");
    date.type = "date";
});

test("input event starts and stops the interaction DatePicked.", () => {
    interaction.registerToNodes([date]);
    date.dispatchEvent(new Event("input"));
    expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
});

test("other event don't trigger the interaction.", () => {
    interaction.registerToNodes([date]);
    date.dispatchEvent(new Event("load"));
    expect(handler.fsmStarts).not.toHaveBeenCalled();
});
