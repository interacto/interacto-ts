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

import { Transition } from "./Transition";
import { FSM } from "./FSM";
import { FSMHandler } from "./FSMHandler";
import { isOutputStateType, OutputState } from "./OutputState";
import { InputState } from "./InputState";
import { Optional } from "../util/Optional";
import { TerminalState } from "./TerminalState";
import { CancellingState } from "./CancellingState";

export class SubFSMTransition extends Transition {
    private readonly subFSM: FSM;

    private readonly subFSMHandler: FSMHandler;

    public constructor(srcState: OutputState, tgtState: InputState, fsm: FSM) {
        super(srcState, tgtState);
        this.subFSM = fsm;
        this.subFSM.setInner(true);
        this.subFSMHandler = new class implements FSMHandler {
            protected _parent: SubFSMTransition;

            constructor(parentFSM: SubFSMTransition) {
                this._parent = parentFSM;
            }

            public fsmStarts(): void {
                this._parent.src.exit();
            }

            public fsmUpdates(): void {
                this._parent.src.getFSM().setCurrentState(this._parent.subFSM.getCurrentState());
                this._parent.src.getFSM().onUpdating();
            }

            public fsmStops(): void {
                this._parent.action(undefined);
                this._parent.subFSM.removeHandler(this._parent.subFSMHandler);
                this._parent.src.getFSM().setCurrentSubFSM(undefined);
                if (this._parent.tgt instanceof TerminalState) {
                    this._parent.tgt.enter();
                    return;
                }
                if (this._parent.tgt instanceof CancellingState) {
                    this.fsmCancels();
                    return;
                }
                if (isOutputStateType(this._parent.tgt)) {
                    this._parent.src.getFSM().setCurrentState(this._parent.tgt);
                    this._parent.tgt.enter();
                }
            }

            public fsmCancels(): void {
                this._parent.subFSM.removeHandler(this._parent.subFSMHandler);
                this._parent.src.getFSM().setCurrentSubFSM(undefined);
                this._parent.src.getFSM().onCancelling();
            }
        }(this);
    }

    /**
     * @param {*} event
     */
    public execute(event: Event): Optional<InputState> {
        if (this.isGuardOK(event)) {
            this.src.getFSM().stopCurrentTimeout();
            const transition: Optional<Transition> = this.findTransition(event);
            if (transition.isPresent()) {
                this.subFSM.addHandler(this.subFSMHandler);
                this.src.getFSM().setCurrentSubFSM(this.subFSM);
                this.subFSM.process(event);
                return Optional.of(transition.get()).map(t => t.tgt);
            }
        }
        return Optional.empty<InputState>();
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public accept(event: Event): boolean {
        return this.findTransition(event).isPresent();
    }

    /**
     *
     * @param {*} event
     * @return {boolean}
     */
    public isGuardOK(event: Event): boolean {
        return this.findTransition(event).filter(tr => tr.isGuardOK(event)).isPresent();
    }

    private findTransition(event: Event): Optional<Transition> {
        return Optional.of(this.subFSM.initState.getTransitions().find(tr => tr.accept(event)));
    }

    /**
     *
     * @return {*[]}
     */
    public getAcceptedEvents(): Set<string> {
        return this.subFSM.initState.getTransitions().map(tr => tr.getAcceptedEvents()).reduce((a, b) => new Set([...a, ...b]));
    }

    public uninstall(): void {
        this.subFSM.uninstall();
    }
}
