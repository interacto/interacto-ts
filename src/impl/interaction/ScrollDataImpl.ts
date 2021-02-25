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

import type {ScrollData} from "../../api/interaction/ScrollData";
import type {Flushable} from "./Flushable";
import {InteractionDataBase} from "./InteractionDataBase";

/**
 * Scrolling interaction data implementation with write access.
 */
export class ScrollDataImpl extends InteractionDataBase implements ScrollData, Flushable {
    protected scrollXData: number = 0;

    protected scrollYData: number = 0;

    public flush(): void {
        super.flush();
        this.scrollXData = 0;
        this.scrollYData = 0;
    }

    public get scrollX(): number {
        return this.scrollXData;
    }

    public get scrollY(): number {
        return this.scrollYData;
    }

    public setScrollData(event: UIEvent): void {
        super.copy(event);

        if (event.view !== null) {
            this.scrollXData = event.view.scrollX;
            this.scrollYData = event.view.scrollY;
        }
    }
}
