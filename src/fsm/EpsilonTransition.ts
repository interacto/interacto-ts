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

import { Transition } from "./Transition";
import { OutputState } from "./OutputState";
import { InputState } from "./InputState";

export class EpsilonTransition extends Transition {
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public accept(event: Event): boolean {
        return true;
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public isGuardOK(event: Event): boolean {
        return true;
    }

    /**
     *
     * @return {*[]}
     */
    public getAcceptedEvents(): Set<string> {
        return new Set([]);
    }
}

