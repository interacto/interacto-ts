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

import { ScrollData } from "./ScrollData";
import { Optional } from "../../util/Optional";

export class ScrollDataImpl implements ScrollData {

    protected scrolledNode: EventTarget | undefined;

    protected px: number | undefined;

    protected py: number | undefined;

    protected increment: number | undefined;

    public constructor() {
    }

    public reinitData(): void {
        this.increment = undefined;
        this.px = undefined;
        this.py = undefined;
        this.scrolledNode = undefined;
    }

    public getIncrement(): number {
        return this.increment === undefined ? 0 : this.increment;
    }

    public getPx(): number {
        return this.px === undefined ? 0 : this.px;
    }

    public getPy(): number {
        return this.py === undefined ? 0 : this.py;
    }

    public getScrolledNode(): Optional<EventTarget> {
        return Optional.of(this.scrolledNode);
    }

    public setScrollData(event: UIEvent): void {
        this.scrolledNode = event.target === null ? undefined : event.target;

        if (event.view !== null) {
            this.increment = this.getIncrement() + (event.view.scrollY === undefined
                || event.view.scrollY < this.getIncrement() ? 0 :
                event.view.scrollY - (this.py === undefined || event.view.scrollY < this.getIncrement() ? 0 : this.py));
            this.px = event.view.scrollX;
            this.py = event.view.scrollY;
        }
    }
}
