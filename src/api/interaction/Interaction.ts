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

import type {InteractionData} from "./InteractionData";
import type {VisitorInteraction} from "./VisitorInteraction";
import type {FSM} from "../fsm/FSM";

/**
 * Infers the interaction data type from an interaction
 * @category API Interaction
 */
export type InteractionDataType<T> = T extends Interaction<infer D> ? D : never;

/**
 * Infers the interaction data types from an array of interactions
 * @category API Interaction
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InteractionsDataTypes<A extends Array<Interaction<any>>> = {
    [K in keyof A]: A[K] extends Interaction<infer T> ? T : never;
};

/**
 * The concept of user interaction.
 * @typeParam D - The type of the interaction data
 * @category API Interaction
 */
export interface Interaction<D extends InteractionData> {
    /**
     * Sets whether the user interaction will stop immediately the propagation
     * of events processed by this user interaction to others listeners.
     * @param stop - True: the propagation of the events will stop immediately.
     */
    stopImmediatePropagation: boolean;

    /**
     * Sets whether the default behavior associated to the event
     * will be executed.
     * @param prevent - True: the default behavior associated to the event
     * will be ignored.
     */
    preventDefault: boolean;

    /**
     * The FSM of the user interaction.
     */
    readonly fsm: FSM;

    /**
     * The interaction data of the user interaction. Cannot be null.
     */
    data: D;

    /**
     * The real name of the interaction.
     */
    readonly name: string;

    /**
     * The registered nodes.
     */
    readonly registeredNodes: ReadonlySet<unknown>;

    /**
     * The nodes for which the user interaction will register their child nodes dynamically.
     */
    readonly dynamicRegisteredNodes: ReadonlySet<unknown>;

    /**
     * @returns Whether the user interaction is running.
     */
    isRunning(): boolean;

    /**
     * @returns True if the user interaction is activated.
     */
    isActivated(): boolean;

    /**
     * Sets whether the user interaction is activated.
     * When not activated, a user interaction does not process
     * input events any more.
     * @param activated - True: the user interaction will be activated.
     */
    setActivated(activated: boolean): void;

    /**
     * Sets the logging of the user interaction.
     * @param log - True: the user interaction will log information.
     */
    log(log: boolean): void;

    registerToNodes(widgets: ReadonlyArray<unknown>): void;

    /**
     * Permits to listen any change in the content (ie children) of the given node.
     * For all child nodes of the given node, this interaction subscribes to it.
     * This is dynamic: on new child nodes, the interaction registers to them.
     * On child removals, the interaction unregisters to them.
     * @param elementToObserve - The node which children will be observed by the interaction.
     */
    registerToNodeChildren(elementToObserve: Node): void;

    /**
     * Sets the timeout (in ms) to be used by the throttling.
     * @param timeout - The throttling timeout in ms.
     */
    setThrottleTimeout(timeout: number): void;

    /**
     * Fully reinitialises the user interaction, its data and its FSM (flushes FSM revents)
     */
    fullReinit(): void;

    /**
     * Reinitialises the user interaction, its data and its FSM
     */
    reinit(): void;

    /**
     * Reinitialises the interaction data
     */
    reinitData(): void;

    /**
     * Uninstall the user interaction. Used to free memory.
     * Then, user interaction can be used any more.
     */
    uninstall(): void;

    /**
     * Visiting the interaction and its FSM.
     * @param visitor - The visitor.
     */
    acceptVisitor(visitor: VisitorInteraction): void;
}
