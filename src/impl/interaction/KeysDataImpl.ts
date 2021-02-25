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

import type {KeysData} from "../../api/interaction/KeysData";
import type {Flushable} from "./Flushable";
import type {KeyData} from "../../api/interaction/KeyData";

export class KeysDataImpl implements KeysData, Flushable {
    private readonly keysData: Array<KeyData> = [];


    public flush(): void {
        this.keysData.length = 0;
    }

    public get keys(): ReadonlyArray<KeyData> {
        return this.keysData;
    }

    public addKey(key: KeyData): void {
        this.keysData.push(key);
    }
}
