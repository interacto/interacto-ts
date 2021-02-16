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

import {InteractionBase} from "../../src/impl/interaction/InteractionBase";
import {InteractionData} from "../../src/api/interaction/InteractionData";
import {FSM} from "../../src/api/fsm/FSM";
import {OutputState} from "../../src/api/fsm/OutputState";
import {Flushable} from "../../src/impl/interaction/library/Flushable";
import {PointDataImpl} from "../../src/impl/interaction/library/PointDataImpl";

export class InteractionStub extends InteractionBase<InteractionData, Flushable & InteractionData, FSM> {
    public constructor(fsm: FSM) {
        super(fsm, new PointDataImpl());
    }

    public updateEventsRegistered(_newState: OutputState, _oldState: OutputState): void {
    }

    public reinitData(): void {
    }
}

