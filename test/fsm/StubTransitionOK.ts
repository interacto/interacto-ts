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
import {StubEvent, StubSubEvent1, StubSubEvent2} from "./StubEvent";
import {InputState} from "../../src/api/fsm/InputState";
import {OutputState} from "../../src/api/fsm/OutputState";

export class StubTransitionOK<E extends StubEvent> extends TransitionBase<E> {
    public guard: boolean;

    public constructor(srcState: OutputState, tgtState: InputState, guard?: boolean) {
        super(srcState, tgtState);
        this.guard = guard ?? true;
    }

    public accept(event: StubEvent): event is E {
        return true;
    }

    public isGuardOK(_event: E): boolean {
        return this.guard;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubEvent"]);
    }
}

export class SubStubTransition1 extends StubTransitionOK<StubSubEvent1> {
    public accept(event: StubEvent): event is StubSubEvent1 {
        return event instanceof StubSubEvent1;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent1"]);
    }
}

export class SubStubTransition2 extends StubTransitionOK<StubSubEvent2> {
    public accept(event: StubEvent): event is StubSubEvent2 {
        return event instanceof StubSubEvent2;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent2"]);
    }
}
