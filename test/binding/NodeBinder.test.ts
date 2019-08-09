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

import {Click} from "../../src/interaction/library/Click";
import {NodeBinder} from "../../src/binding/NodeBinder";
import {DoubleClick} from "../../src/interaction/library/DoubleClick";
import {StubCmd} from "../command/StubCmd";
import {PointData} from "../../src/interaction/library/PointData";

jest.mock("../command/StubCmd");

let widget: HTMLElement;

beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /></div></html>";
    const elt = document.getElementById("canvas1");
    if (elt !== null) {
        widget = elt;
    }
});

test("Node binder ok with click", () => {
    new NodeBinder<StubCmd, Click, PointData>(new Click(), () => new StubCmd()).on(widget).bind();
    widget.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Node binder ok with double-click", () => {
    new NodeBinder<StubCmd, DoubleClick, PointData>(new DoubleClick(), () => new StubCmd()).on(widget).bind();
    widget.click();
    widget.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});
