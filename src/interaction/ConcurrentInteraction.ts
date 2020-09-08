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

import {Subscription} from "rxjs/internal/Subscription";
import {ConcurrentFSM} from "../fsm/ConcurrentFSM";
import {FSM} from "../fsm/FSM";
import {OutputState} from "../fsm/OutputState";
import {InteractionData} from "./InteractionData";
import {InteractionImpl} from "./InteractionImpl";

/**
 * The base implementation of a user interaction that uses concurrent FSMs.
 * @param <D> The type of the interaction data.
 * @param <F> The type of the FSM.
 */
export abstract class ConcurrentInteraction<D extends InteractionData, F extends ConcurrentFSM<FSM>> extends InteractionImpl<D, F> {
    private readonly subscriptions: Array<Subscription>;

    /**
     * Creates the concurrent interaction.
     * @param fsm The concurrent FSM that defines the behavior of the user interaction.
     */
    public constructor(fsm: F) {
        super(fsm);
        this.subscriptions = this.fsm.getConccurFSMs()
            .map(conc => conc.currentStateObservable()
                .subscribe(current => this.updateEventsRegistered(current[1], current[0])));
    }

    public isRunning(): boolean {
        return this.isActivated() && this.fsm.isStarted();
    }

    public onNodeUnregistered(node: EventTarget): void {
        this.getCurrentAcceptedEvents().forEach(type => this.unregisterEventToNode(type, node));
    }

    public onNewNodeRegistered(node: EventTarget): void {
        this.getCurrentAcceptedEvents().forEach(type => this.registerEventToNode(type, node));
    }

    public getCurrentAcceptedEvents(_state?: OutputState): Array<string> {
        return [...new Set(...[this.fsm.getConccurFSMs().flatMap(concFSM => [...this.getEventTypesOf(concFSM.getCurrentState())])])];
    }

    public uninstall(): void {
        super.uninstall();
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
