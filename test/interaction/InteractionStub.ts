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

import type {Logger, FSM, InteractionData, Flushable, OutputState} from "../../src/interacto";
import {InteractionBase, PointDataImpl} from "../../src/interacto";
import {mock} from "jest-mock-extended";

export class InteractionStub extends InteractionBase<InteractionData, Flushable & InteractionData, FSM> {
    public constructor(fsm: FSM, logger?: Logger) {
        super(fsm, new PointDataImpl(), logger ?? mock<Logger>(), InteractionStub.name);
    }

    public override updateEventsRegistered(_newState: OutputState, _oldState: OutputState): void {}

    public override reinitData(): void {}
}

