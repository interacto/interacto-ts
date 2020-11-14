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

import {Pan, PanFSM} from "./Pan";

/**
 * The FSM for the Swipe interaction
 */
class SwipeFSM extends PanFSM {
    private readonly minVelocity: number;

    private t0: number;

    /**
     * Creates the FSM.
     */
    public constructor(horizontal: boolean, minVelocity: number, minLength: number, pxTolerance: number) {
        super(horizontal, minLength, pxTolerance);
        this.minVelocity = minVelocity;
        this.t0 = 0;
    }

    public computeVelocity(t1: number, x: number, y: number): number {
        const value = this.horizontal ? x : y;
        const axe = this.moveAxe ?? 0;
        return Math.abs(axe - value) / ((t1 - this.t0) / 1000);
    }

    protected setInitialValueOnTouch(evt: TouchEvent): void {
        super.setInitialValueOnTouch(evt);
        this.t0 = evt.timeStamp;
    }

    protected checkFinalPanConditions(evt: TouchEvent): boolean {
        return super.checkFinalPanConditions(evt) &&
            this.computeVelocity(evt.timeStamp,
                evt.changedTouches[0].clientX, evt.changedTouches[0].clientY) >= this.minVelocity;
    }

    public reinit(): void {
        super.reinit();
        this.t0 = 0;
    }
}

/**
 * A swipe user interaction.
 */
export class Swipe extends Pan {
    /**
     * Creates the swipe user interaction
     * If this velocity is not reached, the interaction is cancelled.
     * @param horizontal - Defines whether the swipe is horizontal or vertical
     * @param minLength - The minimal distance from the starting point to the release point for validating the swipe
     * @param minVelocity - The minimal velocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the swipe
     */
    public constructor(horizontal: boolean, minVelocity: number, minLength: number, pxTolerance: number) {
        super(horizontal, minLength, pxTolerance, new SwipeFSM(horizontal, minVelocity, minLength, pxTolerance));
    }
}
