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

import {KeyDataImpl} from "../../src/impl/interaction/KeyDataImpl";
import {KeysDataImpl} from "../../src/impl/interaction/KeysDataImpl";
import { beforeEach, describe, expect, test } from "@jest/globals";

describe("using a keys data", () => {
    let data: KeysDataImpl;
    let keyData: KeyDataImpl;
    let sourceData: KeyDataImpl;

    beforeEach(() => {
        data = new KeysDataImpl();
        sourceData = new KeyDataImpl();
        sourceData.copy({
            "code": "KeyQ",
            "key": "KeyA",
            "location": 1,
            "repeat": false,
            "altKey": true,
            "ctrlKey": true,
            "metaKey": true,
            "shiftKey": true,
            "timeStamp": 0,
            "target": null,
            "currentTarget": null
        });
        keyData = new KeyDataImpl();
        keyData.copy(sourceData);
    });

    test("key collection is empty by default", () => {
        expect(data.keys).toHaveLength(0);
    });

    test("addKey", () => {
        data.addKey(keyData);
        expect(data.keys).toHaveLength(1);
        const element = data.keys[0];
        expect(element).toStrictEqual(sourceData);
    });

    test("flush", () => {
        data.addKey(keyData);
        data.flush();
        expect(data.keys).toHaveLength(0);
    });
});
