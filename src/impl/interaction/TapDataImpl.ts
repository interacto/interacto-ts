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

import {PointsDataImpl} from "./PointsDataImpl";
import type {TouchData} from "../../api/interaction/TouchData";

/**
 * Tapping interaction data implementation
 */
export class TapDataImpl extends PointsDataImpl<TouchData> {
    /**
     * Creates the interaction data
     */
    public constructor() {
        super();
    }

    public get lastId(): number | undefined {
        return this.pointsData.at(-1)?.identifier;
    }
}
