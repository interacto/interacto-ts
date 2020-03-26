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

import { PointData } from "./PointData";

export class PointDataImpl implements PointData {
    /** The pressed X-local position. */
    protected srcClientX?: number;
    /** The pressed Y-local position. */
    protected srcClientY?: number;
    /** The pressed X-screen position. */
    protected srcScreenX?: number;
    /** The pressed Y-screen position. */
    protected srcScreenY?: number;

    /** The button used for the pressure. */
    protected button?: number;

    protected altPressed: boolean;

    protected ctrlPressed: boolean;

    protected shiftPressed: boolean;

    protected metaPressed: boolean;

    /** The object picked at the pressed position. */
    protected srcObject?: EventTarget;

    protected currentTarget?: EventTarget;

    public constructor() {
    }

    public flush(): void {
        this.button = undefined;
        this.altPressed = false;
        this.ctrlPressed = false;
        this.shiftPressed = false;
        this.metaPressed = false;
    }

    public isAltPressed(): boolean {
        return this.altPressed;
    }

    public isCtrlPressed(): boolean {
        return this.ctrlPressed;
    }

    public isShiftPressed(): boolean {
        return this.shiftPressed;
    }

    public isMetaPressed(): boolean {
        return this.metaPressed;
    }

    public getButton(): number | undefined {
        return this.button;
    }

    public getSrcObject(): EventTarget | undefined {
        return this.srcObject;
    }

    public getSrcScreenY(): number {
        return this.srcScreenY ?? 0;
    }

    public getSrcScreenX(): number {
        return this.srcScreenX ?? 0;
    }

    public getSrcClientX(): number {
        return this.srcClientX ?? 0;
    }

    public getSrcClientY(): number {
        return this.srcClientY ?? 0;
    }

    public setModifiersData(event: MouseEvent): void {
        this.altPressed = event.altKey;
        this.shiftPressed = event.shiftKey;
        this.ctrlPressed = event.ctrlKey;
        this.metaPressed = event.metaKey;
    }

    public setPointData(cx: number, cy: number, sx: number, sy: number, button: number | undefined, target: EventTarget | undefined,
                        currTarget: EventTarget | undefined): void {
        this.srcClientX = cx;
        this.srcClientY = cy;
        this.srcScreenX = sx;
        this.srcScreenY = sy;
        this.button = button;
        this.srcObject = target;
        this.currentTarget = currTarget;
    }

    public getCurrentTarget(): EventTarget | undefined {
        return this.currentTarget;
    }
}
