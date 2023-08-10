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

import type {Subscription} from "rxjs/internal/Subscription";
import type {FSM} from "../../api/fsm/FSM";
import type {OutputState} from "../../api/fsm/OutputState";
import type {InteractionData} from "../../api/interaction/InteractionData";
import {InteractionBase} from "./InteractionBase";
import type {EventType} from "../../api/fsm/EventType";
import type {Flushable} from "./Flushable";
import type {Logger} from "../../api/logging/Logger";
import type {ConcurrentFSM} from "../../api/fsm/ConcurrentFSM";

/**
 * The base implementation of a user interaction that uses concurrent FSMs.
 * @typeParam D - The type of the interaction data.
 * @typeParam F - The type of the FSM.
 */
export abstract class ConcurrentInteraction<D extends InteractionData, DImpl extends D & Flushable, F extends ConcurrentFSM<FSM>>
    extends InteractionBase<D, DImpl, F> {
    private readonly subscriptions: Array<Subscription>;

    /**
     * Creates the concurrent interaction.
     * @param fsm - The concurrent FSM that defines the behavior of the user interaction.
     * @param data - The interaction data.
     */
    protected constructor(fsm: F, data: DImpl, logger: Logger) {
        super(fsm, data, logger);
        this.subscriptions = this.fsm.getAllConccurFSMs()
            .map(conc => conc.currentStateObservable
                .subscribe(current => {
                    this.updateEventsRegistered(current[1], current[0]);
                }));
    }

    public override isRunning(): boolean {
        return this.isActivated() && this.fsm.started;
    }

    public override onNodeUnregistered(node: EventTarget): void {
        for (const type of this.getCurrentAcceptedEvents()) {
            this.unregisterEventToNode(type, node);
        }
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        for (const type of this.getCurrentAcceptedEvents()) {
            this.registerEventToNode(type, node);
        }
    }

    public override getCurrentAcceptedEvents(_state?: OutputState): ReadonlyArray<EventType> {
        return this.fsm.getAllConccurFSMs().flatMap(concFSM => Array.from(this.getEventTypesOf(concFSM.currentState)));
    }

    public override uninstall(): void {
        super.uninstall();
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
