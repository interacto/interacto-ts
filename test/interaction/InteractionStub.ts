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
import type {InteractionData} from "../../src/api/interaction/InteractionData";
import type {FSM} from "../../src/api/fsm/FSM";
import type {OutputState} from "../../src/api/fsm/OutputState";
import type {Flushable} from "../../src/impl/interaction/Flushable";
import {PointDataImpl} from "../../src/impl/interaction/PointDataImpl";
import type {Logger} from "../../src/api/logging/Logger";

export class InteractionStub extends InteractionBase<InteractionData, Flushable & InteractionData, FSM> {
    public constructor(fsm: FSM, logger?: Logger) {
        super(fsm, new PointDataImpl(), logger);
    }

    public override updateEventsRegistered(_newState: OutputState, _oldState: OutputState): void {
    }

    public override reinitData(): void {
    }
}

