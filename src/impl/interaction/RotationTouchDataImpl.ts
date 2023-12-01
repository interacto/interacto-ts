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

import type {RotationTouchData} from "../../api/interaction/RotationTouchData";
import type {TouchData} from "../../api/interaction/TouchData";
import {TwoTouchDataImpl} from "./TwoTouchDataImpl";

/**
 * The implementation of the rotation interaction data.
 */
export class RotationTouchDataImpl extends TwoTouchDataImpl implements RotationTouchData {
    public constructor() {
        super();
    }

    public get rotationAngle(): number {
        return this.computeAngle(this.t1.src, this.t2.src) - this.computeAngle(this.t1.src, this.t2.tgt);
    }

    private computeAngle(t1: TouchData, t2: TouchData): number {
        return Math.atan2(t2.clientX - t1.clientX, t1.clientY - t2.clientY);
    }
}
