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

import {TwoTouchDataImpl} from "./TwoTouchDataImpl";
import type {LineTouchData} from "../../api/interaction/LineTouchData";

export class TwoPanDataImpl extends TwoTouchDataImpl implements LineTouchData {
    public constructor() {
        super();
    }

    public isVertical(pxTolerance: number): boolean {
        return this.isTop(pxTolerance) || this.isBottom(pxTolerance);
    }

    public isHorizontal(pxTolerance: number): boolean {
        return this.isLeft(pxTolerance) || this.isRight(pxTolerance);
    }

    public isLeft(pxTolerance: number): boolean {
        return this.t1.isLeft(pxTolerance) && this.t2.isLeft(pxTolerance);
    }

    public isRight(pxTolerance: number): boolean {
        return this.t1.isRight(pxTolerance) && this.t2.isRight(pxTolerance);
    }

    public isTop(pxTolerance: number): boolean {
        return this.t1.isTop(pxTolerance) && this.t2.isTop(pxTolerance);
    }

    public isBottom(pxTolerance: number): boolean {
        return this.t1.isBottom(pxTolerance) && this.t2.isBottom(pxTolerance);
    }
}
