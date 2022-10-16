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

import type {TouchData} from "../../api/interaction/TouchData";
import type {TapData} from "../../api/interaction/TapData";
import type {Flushable} from "./Flushable";

/**
 * Tapping interaction data implementation
 */
export class TapDataImpl implements TapData, Flushable {
    private readonly tapsData: Array<TouchData>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.tapsData = [];
    }

    public get taps(): ReadonlyArray<TouchData> {
        return Array.from(this.tapsData);
    }

    /**
     * Adds a touch data to this multi-touch data
     * @param data - The touch data to add
     */
    public addTapData(data: TouchData): void {
        this.tapsData.push(data);
    }

    public flush(): void {
        this.tapsData.length = 0;
    }
}
