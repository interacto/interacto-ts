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
import {PointingDataBase} from "./PointingDataBase";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";
import type {EventModifierData} from "../../api/interaction/EventModifierData";

export class TouchDataImpl extends PointingDataBase implements TouchData {
    private _allTouches: Array<TouchData> = [];

    private altitudeAngleData: number = 0;

    private azimuthAngleData: number = 0;

    private forceData: number = 0;

    private identifierData: number = 0;

    private radiusXData: number = 0;

    private radiusYData: number = 0;

    private rotationAngleData: number = 0;

    private touchTypeData: TouchType = "direct";


    public get allTouches(): ReadonlyArray<TouchData> {
        return this._allTouches;
    }

    public get altitudeAngle(): number {
        return this.altitudeAngleData;
    }

    public get azimuthAngle(): number {
        return this.azimuthAngleData;
    }

    public get force(): number {
        return this.forceData;
    }

    public get identifier(): number {
        return this.identifierData;
    }

    public get radiusX(): number {
        return this.radiusXData;
    }

    public get radiusY(): number {
        return this.radiusYData;
    }

    public get rotationAngle(): number {
        return this.rotationAngleData;
    }

    public get touchType(): TouchType {
        return this.touchTypeData;
    }


    public override copy(data: TouchData): void {
        super.copy(data);
        this.altitudeAngleData = data.altitudeAngle;
        this.azimuthAngleData = data.azimuthAngle;
        this.forceData = data.force;
        this.identifierData = data.identifier;
        this.radiusXData = data.radiusX;
        this.radiusYData = data.radiusY;
        this.rotationAngleData = data.rotationAngle;
        this.touchTypeData = data.touchType;
        this._allTouches = data.allTouches.map(t => {
            const newT = new TouchDataImpl();
            newT.copy(t);
            return newT;
        });
    }

    public override flush(): void {
        super.flush();
        this.altitudeAngleData = 0;
        this.azimuthAngleData = 0;
        this.forceData = 0;
        this.identifierData = 0;
        this.radiusXData = 0;
        this.radiusYData = 0;
        this.rotationAngleData = 0;
        this.touchTypeData = "direct";
        this._allTouches = [];
    }

    public static mergeTouchEventData(touch: Touch, evt: EventModifierData & UnitInteractionData, allTouches: Array<Touch>): TouchData {
        const data = new TouchDataImpl();
        // Not beautiful code but other tries did not work
        // 'assign' and spread do not work with events (polyfill concern? Or front interfaces for legacy back API?).
        data.copy({
            "altitudeAngle": touch.altitudeAngle,
            "azimuthAngle": touch.azimuthAngle,
            "clientX": touch.clientX,
            "clientY": touch.clientY,
            "force": touch.force,
            "identifier": touch.identifier,
            "pageX": touch.pageX,
            "pageY": touch.pageY,
            "radiusX": touch.radiusX,
            "radiusY": touch.radiusY,
            "rotationAngle": touch.rotationAngle,
            "screenX": touch.screenX,
            "screenY": touch.screenY,
            "target": touch.target,
            "touchType": touch.touchType,
            "allTouches": allTouches.map(t => TouchDataImpl.mergeTouchEventData(t, evt, [])),
            "timeStamp": evt.timeStamp,
            "altKey": evt.altKey,
            "shiftKey": evt.shiftKey,
            "ctrlKey": evt.ctrlKey,
            "metaKey": evt.metaKey,
            "currentTarget": evt.currentTarget
        });
        return data;
    }
}
