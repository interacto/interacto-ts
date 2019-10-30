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
import { InteractionImpl, InteractionData, FSM, OutputState } from "../../src";

export class DataStub implements InteractionData {
}

export class InteractionStub extends InteractionImpl<InteractionData, FSM, Object> {
	public constructor(fsm: FSM) {
		super(fsm);
	}

	public getData(): InteractionData {
		return new DataStub();
	}

	public updateEventsRegistered(newState: OutputState, oldState: OutputState): void {
	}

	public isEventsOfSameType(evt1: Object, evt2: Object): boolean {
		return false;
	}

	public reinitData(): void {
	}
}

