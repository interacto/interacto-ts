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
import type {InputState} from "../../src/api/fsm/InputState";
import type {OutputState} from "../../src/api/fsm/OutputState";
import type {EventType} from "../../src/api/fsm/EventType";
import {isEventType} from "../../src/impl/fsm/Events";

export class StubTransitionOK<E extends Event> extends TransitionBase<E> {
    public guard: boolean;

    public constructor(srcState: OutputState, tgtState: InputState, guard?: boolean) {
        super(srcState, tgtState);
        this.guard = guard ?? true;
    }

    public accept(event: Event): event is E {
        return true;
    }

    public override isGuardOK(_event: E): boolean {
        return this.guard;
    }

    public getAcceptedEvents(): Array<EventType> {
        return ["input"];
    }
}

export class SubStubTransition1 extends StubTransitionOK<MouseEvent> {
    public override accept(event: Event): event is MouseEvent {
        return event instanceof MouseEvent && isEventType(event.type) && this.getAcceptedEvents().includes(event.type);
    }

    public override getAcceptedEvents(): Array<EventType> {
        return ["click"];
    }
}

export class SubStubTransition2 extends StubTransitionOK<KeyboardEvent> {
    public override accept(event: Event): event is KeyboardEvent {
        return event instanceof KeyboardEvent && isEventType(event.type) && this.getAcceptedEvents().includes(event.type);
    }

    public override getAcceptedEvents(): Array<EventType> {
        return ["keydown"];
    }
}

export class SubStubTransition3 extends StubTransitionOK<TouchEvent> {
    public override accept(event: Event): event is TouchEvent {
        return event instanceof TouchEvent && isEventType(event.type) && this.getAcceptedEvents().includes(event.type);
    }

    public override getAcceptedEvents(): Array<EventType> {
        return ["touchstart"];
    }
}
