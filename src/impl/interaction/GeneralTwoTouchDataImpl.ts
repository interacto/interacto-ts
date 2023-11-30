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

import type {LineTouchData} from "../../api/interaction/LineTouchData";
import type {RotationData} from "../../api/interaction/RotationTouchData";
import type {GeneralTwoTouchData} from "../../api/interaction/TwoTouchData";
import {RotationDataImpl} from "./RotationDataImpl";
import {TwoPanDataImpl} from "./TwoPanDataImpl";
import {TwoTouchDataImpl} from "./TwoTouchDataImpl";

export class GeneralTwoTouchDataImpl extends TwoTouchDataImpl implements GeneralTwoTouchData {
    private readonly rotateData: RotationData;

    private readonly panData: LineTouchData;

    public constructor() {
        super();
        this.rotateData = new RotationDataImpl();
        this.panData = new TwoPanDataImpl();
    }

    public isVertical(pxTolerance: number): boolean {
        return this.panData.isVertical(pxTolerance);
    }

    public isHorizontal(pxTolerance: number): boolean {
        return this.panData.isHorizontal(pxTolerance);
    }

    public isLeft(pxTolerance: number): boolean {
        return this.panData.isLeft(pxTolerance);
    }

    public isRight(pxTolerance: number): boolean {
        return this.panData.isRight(pxTolerance);
    }

    public isTop(pxTolerance: number): boolean {
        return this.panData.isTop(pxTolerance);
    }

    public isBottom(pxTolerance: number): boolean {
        return this.panData.isBottom(pxTolerance);
    }

    public get rotationAngle(): number {
        return this.rotateData.rotationAngle;
    }
}
