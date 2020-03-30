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

import { InteractionImpl } from "../../src/interaction/InteractionImpl";
import { InteractionData } from "../../src/interaction/InteractionData";
import { FSM } from "../../src/fsm/FSM";
import { OutputState } from "../../src/fsm/OutputState";
import { PointDataImpl } from "../../src/interaction/library/PointDataImpl";

export class InteractionStub extends InteractionImpl<InteractionData, FSM> {
    public constructor(fsm: FSM) {
        super(fsm);
    }

    public updateEventsRegistered(_newState: OutputState, _oldState: OutputState): void {
    }

    public isEventsOfSameType(_evt1: object, _evt2: object): boolean {
        return false;
    }

    public reinitData(): void {
    }

    protected createDataObject(): InteractionData {
        return new PointDataImpl();
    }
}

