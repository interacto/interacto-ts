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

import {TransitionBase} from "../../src/impl/fsm/TransitionBase";
import type {EventType} from "../../src/api/fsm/EventType";
import type {InputState} from "../../src/api/fsm/InputState";
import type {OutputState} from "../../src/api/fsm/OutputState";

export class StubTransitionOK<E extends Event> extends TransitionBase<E> {
    public _guard: boolean;

    public constructor(srcState: OutputState, tgtState: InputState, guard?: boolean) {
        super(srcState, tgtState, undefined, () => this._guard);
        this._guard = guard ?? true;
    }

    public accept(event: Event): event is E {
        return true;
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        return new Set(["input"]);
    }
}

export class SubStubTransition1 extends StubTransitionOK<MouseEvent> {
    public override accept(event: Event): event is MouseEvent {
        return event instanceof MouseEvent && this.getAcceptedEvents().has(event.type as EventType);
    }

    public override getAcceptedEvents(): ReadonlySet<EventType> {
        return new Set(["click"]);
    }
}

export class SubStubTransition2 extends StubTransitionOK<KeyboardEvent> {
    public override accept(event: Event): event is KeyboardEvent {
        return event instanceof KeyboardEvent && this.getAcceptedEvents().has(event.type as EventType);
    }

    public override getAcceptedEvents(): ReadonlySet<EventType> {
        return new Set(["keydown"]);
    }
}

export class SubStubTransition3 extends StubTransitionOK<TouchEvent> {
    public override accept(event: Event): event is TouchEvent {
        return event instanceof TouchEvent && this.getAcceptedEvents().has(event.type as EventType);
    }

    public override getAcceptedEvents(): ReadonlySet<EventType> {
        return new Set(["touchstart"]);
    }
}
