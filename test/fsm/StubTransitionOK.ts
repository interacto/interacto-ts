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

import {Transition} from "../../src/src-core/fsm/Transition";
import {StubEvent, StubSubEvent1, StubSubEvent2, StubSubEvent3} from "./StubEvent";
import {InputState} from "../../src/src-core/fsm/InputState";
import {OutputState} from "../../src/src-core/fsm/OutputState";

export class StubTransitionOK extends Transition<StubEvent> {
    public guard: boolean;

    public constructor(srcState: OutputState<StubEvent>, tgtState: InputState<StubEvent>, guard ?: boolean) {
        super(srcState, tgtState);
        this.guard = guard === undefined ? true : guard;
    }

    public accept(event: StubEvent): boolean {
        return true;
    }

    public isGuardOK(event: StubEvent): boolean {
        return this.guard;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubEvent"]);
    }
}

export class SubStubTransition1 extends StubTransitionOK {
    public constructor(srcState: OutputState<StubEvent>, tgtState: InputState<StubEvent>, guard ?: boolean) {
        super(srcState, tgtState, guard);
    }

    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent1;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set("StubSubEvent1");
    }
}

export class SubStubTransition2 extends StubTransitionOK {
    public constructor(srcState: OutputState<StubEvent>, tgtState: InputState<StubEvent>, guard ?: boolean) {
        super(srcState, tgtState, guard);
    }

    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent2;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set("StubSubEvent2");
    }
}

export class SubStubTransition3 extends StubTransitionOK {
    public constructor(srcState: OutputState<StubEvent>, tgtState: InputState<StubEvent>, guard ?: boolean) {
        super(srcState, tgtState, guard);
    }

    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent3;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set("StubSubEvent3");
    }
}
