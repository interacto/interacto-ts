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

import {TransitionBase} from "./TransitionBase";
import type {FSM} from "../../api/fsm/FSM";
import type {FSMHandler} from "../../api/fsm/FSMHandler";
import type {OutputState} from "../../api/fsm/OutputState";
import {isOutputStateType} from "../../api/fsm/OutputState";
import type {InputState} from "../../api/fsm/InputState";
import {TerminalState} from "./TerminalState";
import {CancellingState} from "./CancellingState";
import type {Subscription} from "rxjs";
import type {Transition} from "../../api/fsm/Transition";
import type {EventType} from "../../api/fsm/EventType";

/**
 * A transition that refers to another FSM.
 * Entering this transition starts the underlying sub-FSM.
 * To leave the transition, the sub-FSM must end.
 */
export class SubFSMTransition extends TransitionBase<Event> {
    private readonly subFSM: FSM;

    private readonly subFSMHandler: FSMHandler;

    /**
     * Temporary subscription to the current state of the sub-FSM.
     */
    private subStateSubscription?: Subscription;

    /**
     * Creates the transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The output state of the transition.
     * @param fsm - The inner FSM that composes the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState, fsm: FSM,
                       action?: (evt: Event) => void) {
        super(srcState, tgtState, action, (evt: Event) => this.findTransition(evt)?.guard(evt) ?? false);
        this.subFSM = fsm;
        this.subFSM.inner = true;
        this.subFSMHandler = {
            "fsmStarts": (): void => {
                this.src.exit();
            },
            "fsmUpdates": (): void => {
                this.src.fsm.onUpdating();
            },
            "fsmStops": (): void => {
                this.action(new Event(""));
                this.unsetFSMHandler();
                if (this.tgt instanceof TerminalState) {
                    this.tgt.enter();
                    return;
                }
                if (this.tgt instanceof CancellingState) {
                    this.cancelsFSM();
                    return;
                }
                if (isOutputStateType(this.tgt)) {
                    this.src.fsm.currentState = this.tgt;
                    this.tgt.enter();
                }
            },
            "fsmCancels": (): void => {
                this.cancelsFSM();
            },
            "fsmError": (err: unknown): void => {
                this.src.fsm.onError(err);
            }
        };
    }

    /**
     * When has to setting up the subFSM
     */
    private setUpFSMHandler(): void {
        this.subFSM.addHandler(this.subFSMHandler);
        this.src.fsm.currentSubFSM = this.subFSM;
        this.subStateSubscription = this.subFSM.currentStateObservable
            .subscribe(value => {
                // eslint-disable-next-line @typescript-eslint/prefer-destructuring
                this.src.fsm.currentState = value[1];
            });
    }

    /**
     * If the subFSM is not more used to should be unset.
     */
    private unsetFSMHandler(): void {
        this.subFSM.removeHandler(this.subFSMHandler);
        this.src.fsm.currentSubFSM = undefined;
        this.subStateSubscription?.unsubscribe();
    }

    private cancelsFSM(): void {
        this.unsetFSMHandler();
        this.src.fsm.onCancelling();
    }

    public override execute(event: Event): InputState | undefined {
        const transition: Transition<Event> | undefined = this.findTransition(event);

        if (transition === undefined) {
            return undefined;
        }

        this.src.fsm.stopCurrentTimeout();
        this.setUpFSMHandler();
        this.subFSM.process(event);
        return transition.target;
    }

    public accept(event: Event): event is Event {
        return this.findTransition(event) !== undefined;
    }

    private findTransition(event: Event): Transition<Event> | undefined {
        return this.subFSM
            .initState
            .transitions
            .find(tr => tr.accept(event));
    }

    public getAcceptedEvents(): ReadonlySet<EventType> {
        // Optimisation to avoid map and reduce
        const result = new Set<EventType>();
        for (const t of this.subFSM.initState.transitions) {
            for (const evt of t.getAcceptedEvents()) {
                result.add(evt);
            }
        }
        return result;
    }

    public override uninstall(): void {
        this.unsetFSMHandler();
        this.subFSM.uninstall();
    }
}
