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

import {InteractionDataBase} from "./InteractionDataBase";
import {PointBaseData} from "../../../api/interaction/PointBaseData";

export abstract class PointingDataBase extends InteractionDataBase implements PointBaseData {
    protected clientXData: number = 0;

    protected clientYData: number = 0;

    protected pageXData: number = 0;

    protected pageYData: number = 0;

    protected screenXData: number = 0;

    protected screenYData: number = 0;

    protected altKeyData: boolean = false;

    protected ctrlKeyData: boolean = false;

    protected metaKeyData: boolean = false;

    protected shiftKeyData: boolean = false;


    public flush(): void {
        super.flush();
        this.clientXData = 0;
        this.clientYData = 0;
        this.pageXData = 0;
        this.pageYData = 0;
        this.screenXData = 0;
        this.screenYData = 0;
        this.altKeyData = false;
        this.ctrlKeyData = false;
        this.metaKeyData = false;
        this.shiftKeyData = false;
    }


    public copy(data: PointBaseData): void {
        super.copy(data);
        // Cannot use Object.assign because of a strange implementation of Event
        // that prevents accessing the properties
        this.clientXData = data.clientX;
        this.clientYData = data.clientY;
        this.pageXData = data.pageX;
        this.pageYData = data.pageY;
        this.screenXData = data.screenX;
        this.screenYData = data.screenY;
        this.altKeyData = data.altKey;
        this.ctrlKeyData = data.ctrlKey;
        this.metaKeyData = data.metaKey;
        this.shiftKeyData = data.shiftKey;
    }

    public get clientX(): number {
        return this.clientXData;
    }

    public get clientY(): number {
        return this.clientYData;
    }

    public get pageX(): number {
        return this.pageXData;
    }

    public get pageY(): number {
        return this.pageYData;
    }

    public get screenX(): number {
        return this.screenXData;
    }

    public get screenY(): number {
        return this.screenYData;
    }

    public get altKey(): boolean {
        return this.altKeyData;
    }

    public get ctrlKey(): boolean {
        return this.ctrlKeyData;
    }

    public get metaKey(): boolean {
        return this.metaKeyData;
    }

    public get shiftKey(): boolean {
        return this.shiftKeyData;
    }
}
