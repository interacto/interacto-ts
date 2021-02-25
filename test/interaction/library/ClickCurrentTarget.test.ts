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
import {Click, PointDataImpl} from "../../../src/interacto";
import type {MockProxy} from "jest-mock-extended";
import {mock} from "jest-mock-extended";
import {robot} from "../StubEvents";

let interaction: Click;
let groupe: HTMLElement;
let circle: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;

beforeEach(() => {
    handler = mock<FSMHandler>();
    interaction = new Click();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><svg><g id='gro'><circle r=\"1\" id='circle'></circle><text></text></g></svg></html>";
    groupe = document.getElementById("gro") as HTMLElement;
    circle = document.getElementById("circle") as HTMLElement;
});

test("current target with group tag", () => {
    const data = new PointDataImpl();
    handler.fsmStops.mockImplementation(() => {
        data.copy(interaction.getData());
    });

    interaction.registerToNodes([groupe]);
    robot().click(circle);
    expect(data.target).toBe(circle);
});
