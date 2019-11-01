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

import { FSM } from "../../fsm/FSM";
import { Optional } from "../../util/Optional";
import { ScrollData } from "./ScrollData";
import { ScrollDataImpl } from "./ScrollDataImpl";
import { InteractionImpl } from "../InteractionImpl";

export abstract class ScrollInteraction<D extends ScrollData, F extends FSM, T> extends InteractionImpl<D, F, T>
    implements ScrollData {
    public readonly scrollData: ScrollDataImpl;

    protected constructor(fsm: F) {
        super(fsm);
        this.scrollData = new ScrollDataImpl();
    }

    public reinitData(): void {
        super.reinitData();
        this.scrollData.reinitData();
    }

    public getIncrement(): number {
        return this.scrollData.getIncrement();
    }

    public getPx(): number {
        return this.scrollData.getPx();
    }

    public getPy(): number {
        return this.scrollData.getPy();
    }

    public getScrolledNode(): Optional<EventTarget> {
        return this.scrollData.getScrolledNode();
    }

    public setScrollData(event: UIEvent) {
        this.scrollData.setScrollData(event);
    }
}
