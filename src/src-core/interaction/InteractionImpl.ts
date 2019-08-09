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

import {FSM} from "../fsm/FSM";
import {OutputState} from "../fsm/OutputState";
import {InitState} from "../fsm/InitState";
import {Logger} from "typescript-logging";
import {catInteraction} from "../logging/ConfigLog";
import {InteractionData} from "./InteractionData";

export abstract class InteractionImpl<D extends InteractionData, E, F extends FSM<E>> {
    protected logger: Logger | undefined;

    protected readonly fsm: F;

    protected asLog: boolean;

    /**
     * Defines if the interaction is activated or not. If not, the interaction will not
     * change on events.
     */
    protected activated: boolean;

    protected constructor(fsm: F) {
        this.activated = false;
        this.fsm = fsm;
        fsm.currentStateProp().obs((oldValue, newValue) => this.updateEventsRegistered(newValue, oldValue));
        this.activated = true;
        this.asLog = false;
    }

    protected abstract updateEventsRegistered(newState: OutputState<E>, oldState: OutputState<E>): void;

    public isRunning(): boolean {
        return this.activated && !(this.fsm.currentState instanceof InitState);
    }

    public fullReinit(): void {
        this.fsm.fullReinit();
    }

    public processEvent(event: E): void {
        if (this.isActivated()) {
            this.fsm.process(event);
        }
    }

    public log(log: boolean): void {
        this.asLog = log;
        this.fsm.log(log);
    }

    public isActivated(): boolean {
        return this.activated;
    }

    public setActivated(activated: boolean): void {
        if (this.asLog) {
            catInteraction.info("Interaction activation: " + String(activated));
        }
        this.activated = activated;
        if (!activated) {
            this.fsm.fullReinit();
        }
    }

    public getFsm(): F {
        return this.fsm;
    }

    public abstract getData(): D;

    protected reinit(): void {
        this.fsm.reinit();
        this.reinitData();
    }

    protected abstract reinitData(): void;

    public uninstall(): void {
        this.setActivated(false);
    }
}
