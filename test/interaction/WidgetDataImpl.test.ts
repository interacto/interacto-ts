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

import {WidgetDataImpl} from "../../src/impl/interaction/WidgetDataImpl";
import { beforeEach, describe, expect, test } from "@jest/globals";
import type {UnitInteractionData} from "../../src/api/interaction/UnitInteractionData";

describe("using a widget data", () => {
    let data: WidgetDataImpl<HTMLButtonElement>;
    let touchData: UnitInteractionData;

    beforeEach(() => {
        data = new WidgetDataImpl();
        const button: HTMLButtonElement = document.createElement("button");
        touchData = {
            "timeStamp": 17,
            "target": button,
            "currentTarget": new EventTarget()
        };
        data.copy(touchData);
    });

    test("widget", () => {
        expect(data.widget).toBeInstanceOf(HTMLButtonElement);
    });
});
