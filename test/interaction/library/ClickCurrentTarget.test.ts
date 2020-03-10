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
import { Click } from "../../../src/interaction/library/Click";
import { createMouseEvent } from "../StubEvents";

jest.mock("../../fsm/StubFSMHandler");

let interaction: Click;
let groupe: HTMLElement;
let circle: HTMLElement;
let handler: FSMHandler;

beforeEach(() => {
    jest.clearAllMocks();
    handler = new StubFSMHandler();
    interaction = new Click();
    interaction.log(true);
    interaction.getFsm().log(true);
    interaction.getFsm().addHandler(handler);
    document.documentElement.innerHTML = "<html><svg><g id='gro'><circle r=\"1\" id='circle'></circle><text></text></g></svg></html>";
    const elt = document.getElementById("gro");
    const elt2 = document.getElementById("circle");
    if (elt !== null && elt2 !== null) {
        groupe = elt;
        circle = elt2;
    }
});

test("current target with group tag", () => {
    interaction.registerToNodes([groupe]);
    circle.dispatchEvent(createMouseEvent("click", circle));
    expect(interaction.pointData.getCurrentTarget().get()).toBe(groupe);
});
