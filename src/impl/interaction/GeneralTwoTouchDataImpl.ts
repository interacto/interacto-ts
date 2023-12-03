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

import {RotationTouchDataImpl} from "./RotationTouchDataImpl";
import {ScaleTouchDataImpl} from "./ScaleTouchDataImpl";
import {TwoPanDataImpl} from "./TwoPanDataImpl";
import {TwoTouchDataImpl} from "./TwoTouchDataImpl";
import type {LineTouchData} from "../../api/interaction/LineTouchData";
import type {RotationTouchData} from "../../api/interaction/RotationTouchData";
import type {ScaleTouchData} from "../../api/interaction/ScaleTouchData";
import type {GeneralTwoTouchData} from "../../api/interaction/TwoTouchData";

/**
 * The interaction data that stores all information related to two-touch based user
 * interactions.
 */
export class GeneralTwoTouchDataImpl extends TwoTouchDataImpl implements GeneralTwoTouchData {
    private readonly rotateData: RotationTouchData;

    private readonly panData: LineTouchData;

    private readonly scaleData: ScaleTouchData;

    public constructor() {
        super();
        this.rotateData = new RotationTouchDataImpl();
        this.panData = new TwoPanDataImpl();
        this.scaleData = new ScaleTouchDataImpl();
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

    public scalingRatio(pxTolerance: number): number {
        return this.scaleData.scalingRatio(pxTolerance);
    }
}
