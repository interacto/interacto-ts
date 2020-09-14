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

import {ScrollData} from "./ScrollData";

/**
 * Scrolling interaction data implementation with write access.
 */
export class ScrollDataImpl implements ScrollData {
    protected scrolledNode?: EventTarget;

    protected px?: number;

    protected py?: number;

    protected increment?: number;

    public flush(): void {
        this.increment = undefined;
        this.px = undefined;
        this.py = undefined;
        this.scrolledNode = undefined;
    }

    public getIncrement(): number {
        return this.increment ?? 0;
    }

    public getPx(): number {
        return this.px ?? 0;
    }

    public getPy(): number {
        return this.py ?? 0;
    }

    public getScrolledNode(): EventTarget | undefined {
        return this.scrolledNode;
    }

    public setScrollData(event: UIEvent): void {
        this.scrolledNode = event.target ?? undefined;

        if (event.view !== null) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.increment = this.getIncrement() + (event.view.scrollY === undefined ||
                event.view.scrollY < this.getIncrement() ? 0
                : event.view.scrollY - (this.py === undefined || event.view.scrollY < this.getIncrement() ? 0 : this.py));
            this.px = event.view.scrollX;
            this.py = event.view.scrollY;
        }
    }
}
