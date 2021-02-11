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

import {KeysData} from "../../../api/interaction/KeysData";
import {Flushable} from "./Flushable";

export class KeysDataImpl implements KeysData, Flushable {
    /**
     * The keys involve in the interaction
     */
    protected keys?: Array<string>;

    /**
     * The target of the event that trigger the interaction
     */
    protected target?: EventTarget;

    public flush(): void {
        this.keys = undefined;
        this.target = undefined;
    }

    public getKeys(): ReadonlyArray<string> {
        return this.keys ?? [];
    }

    public getTarget(): EventTarget | undefined {
        return this.target;
    }

    public setKeysDataTarget(event: KeyboardEvent): void {
        this.target = event.target ?? undefined;
    }

    public addKeysDataKey(event: KeyboardEvent): void {
        if (this.keys === undefined) {
            this.keys = [event.code];
        } else {
            this.keys.push(event.code);
        }
    }
}
