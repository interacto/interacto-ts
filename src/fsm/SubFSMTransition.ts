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

import {Transition} from "./Transition";
import {FSM} from "./FSM";
import {FSMHandler} from "./FSMHandler";
import {isOutputStateType, OutputState} from "./OutputState";
import {InputState} from "./InputState";
import {TerminalState} from "./TerminalState";
import {CancellingState} from "./CancellingState";

/**
 * A transition that refers to another FSM.
 * Entering this transition starts the underlying sub-FSM.
 * To leave the transition, the sub-FSM must end.
 */
export class SubFSMTransition extends Transition {
    private readonly subFSM: FSM;

    private readonly subFSMHandler: FSMHandler;

    /**
     * Creates the transition.
     * @param srcState The source state of the transition.
     * @param tgtState The output state of the transition.
     * @param fsm The inner FSM that composes the transition.
     */
    public constructor(srcState: OutputState, tgtState: InputState, fsm: FSM) {
        super(srcState, tgtState);
        this.subFSM = fsm;
        this.subFSM.setInner(true);
        this.subFSMHandler = {
            "fsmStarts": (): void => {
                this.src.exit();
            },
            "fsmUpdates": (): void => {
                this.src.getFSM().setCurrentState(this.subFSM.getCurrentState());
                this.src.getFSM().onUpdating();
            },
            "fsmStops": (): void => {
                this.action(undefined);
                this.subFSM.removeHandler(this.subFSMHandler);
                this.src.getFSM().setCurrentSubFSM(undefined);
                if (this.tgt instanceof TerminalState) {
                    this.tgt.enter();
                    return;
                }
                if (this.tgt instanceof CancellingState) {
                    this.cancelsFSM();
                    return;
                }
                if (isOutputStateType(this.tgt)) {
                    this.src.getFSM().setCurrentState(this.tgt);
                    this.tgt.enter();
                }
            },
            "fsmCancels": (): void => this.cancelsFSM()
        };
    }

    private cancelsFSM(): void {
        this.subFSM.removeHandler(this.subFSMHandler);
        this.src.getFSM().setCurrentSubFSM(undefined);
        this.src.getFSM().onCancelling();
    }

    public execute(event: Event): InputState | undefined {
        const transition: Transition | undefined = this.findTransition(event);

        if (transition === undefined) {
            return undefined;
        }

        this.src.getFSM().stopCurrentTimeout();
        this.subFSM.addHandler(this.subFSMHandler);
        this.src.getFSM().setCurrentSubFSM(this.subFSM);
        this.subFSM.process(event);
        return transition.tgt;
    }

    public accept(event: Event): boolean {
        return this.findTransition(event) !== undefined;
    }

    public isGuardOK(event: Event): boolean {
        return this.findTransition(event)?.isGuardOK(event) ?? false;
    }

    private findTransition(event: Event): Transition | undefined {
        return this.subFSM.initState.getTransitions().find(tr => tr.accept(event));
    }

    public getAcceptedEvents(): Set<string> {
        if (this.subFSM.initState.getTransitions().length === 0) {
            return new Set();
        }

        return this.subFSM.initState
            .getTransitions()
            .map(tr => tr.getAcceptedEvents())
            .reduce((a, b) => new Set([...a, ...b]));
    }

    public uninstall(): void {
        this.subFSM.uninstall();
    }
}
