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

import {TouchData} from "../../../api/interaction/TouchData";
import {TapData} from "../../../api/interaction/TapData";
import {TouchDataImpl} from "./TouchDataImpl";

/**
 * Tapping interaction data implementation
 */
export class TapDataImpl implements TapData {
    private readonly tapsData: Array<TouchDataImpl>;

    /**
     * Creates the interaction data
     */
    public constructor() {
        this.tapsData = new Array<TouchDataImpl>();
    }

    public getTapData(): Array<TouchData> {
        return [...this.tapsData];
    }

    /**
     * Adds a touch data to this multi-touch data
     * @param data The touch data to add
     */
    public addTapData(data: TouchDataImpl): void {
        this.tapsData.push(data);
    }

    public flush(): void {
        this.tapsData.length = 0;
    }
}
