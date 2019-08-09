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

import {FSM} from "../../src-core/fsm/FSM";
import {TSInteraction} from "../TSInteraction";
import {PointData} from "./PointData";
import {PointDataImpl} from "./PointDataImpl";
import {Optional} from "../../util/Optional";

export abstract class PointInteraction<D extends PointData, F extends FSM<Event>, T> extends TSInteraction<D, F, T> implements PointData {
    public readonly pointData: PointDataImpl;

    protected constructor(fsm: F) {
        super(fsm);
        this.pointData = new PointDataImpl();
    }

    public reinitData(): void {
        super.reinitData();
        this.pointData.reinitData();
    }

    public setPointData(event: MouseEvent): void {
        this.pointData.setPointData(event);
    }

    public getButton(): number | undefined {
        return this.pointData.getButton();
    }

    public getSrcClientX(): number {
        return this.pointData.getSrcClientX();
    }

    public getSrcClientY(): number {
        return this.pointData.getSrcClientY();
    }

    public getSrcObject(): Optional<EventTarget> {
        return this.pointData.getSrcObject();
    }

    public getSrcScreenX(): number {
        return this.pointData.getSrcScreenX();
    }

    public getSrcScreenY(): number {
        return this.pointData.getSrcScreenY();
    }

    public isAltPressed(): boolean {
        return this.pointData.isAltPressed();
    }

    public isCtrlPressed(): boolean {
        return this.pointData.isCtrlPressed();
    }

    public isMetaPressed(): boolean {
        return this.pointData.isMetaPressed();
    }

    public isShiftPressed(): boolean {
        return this.pointData.isShiftPressed();
    }

    public getCurrentTarget(): Optional<EventTarget> {
        return this.pointData.getCurrentTarget();
    }
}
