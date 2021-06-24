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

import {ScrollDataImpl} from "../../src/impl/interaction/ScrollDataImpl";
import {mock} from "jest-mock-extended";

let data: ScrollDataImpl;
let evt: UIEvent;

beforeEach(() => {
    data = new ScrollDataImpl();

    evt = new UIEvent("mousedown");
    const view = mock<Window>();
    Object.defineProperties(view, {
        "scrollX": {
            get(): number {
                return 14;
            }
        },
        "scrollY": {
            get(): number {
                return 16;
            }
        }
    });
    jest.spyOn(evt, "view", "get")
        .mockReturnValue(view);
});

test("setScrollData view is not null", () => {
    data.setScrollData(evt);
    expect(data.scrollX).toBe(14);
    expect(data.scrollY).toBe(16);
});

test("setScrollData view is null", () => {
    jest.spyOn(evt, "view", "get")
        .mockReturnValue(null);
    data.setScrollData(evt);
    expect(data.scrollX).toBe(0);
    expect(data.scrollX).toBe(0);
});

test("flush", () => {
    data.setScrollData(evt);
    data.flush();
    expect(data.scrollX).toBe(0);
    expect(data.scrollY).toBe(0);
});
