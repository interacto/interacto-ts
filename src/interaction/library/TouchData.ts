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

import { SrcTgtPointsData, SrcTgtPointsDataImpl } from "./SrcTgtPointsData";

export interface TouchData extends SrcTgtPointsData {
    /**
	 * @return The ID of the touch.
	 */
    getTouchId(): number;
}

export class TouchDataImpl extends SrcTgtPointsDataImpl implements TouchData {
    private touchID: number;

    public constructor() {
        super();
        this.touchID = -1;
    }

    public getTouchId(): number {
        return this.touchID;
    }

    public setTouchId(id: number): void {
        this.touchID = id;
    }

    public flush(): void {
        super.flush();
        this.touchID = -1;
    }

    public getButton(): number | undefined {
        return undefined;
    }

    public isAltPressed(): boolean {
        return false;
    }

    public isCtrlPressed(): boolean {
        return false;
    }

    public isShiftPressed(): boolean {
        return false;
    }

    public isMetaPressed(): boolean {
        return false;
    }
}
