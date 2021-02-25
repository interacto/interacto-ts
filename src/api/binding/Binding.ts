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

import type {FSMHandler} from "../fsm/FSMHandler";
import type {Interaction} from "../interaction/Interaction";
import type {Command} from "../command/Command";
import type {Observable} from "rxjs";
import type {InteractionData} from "../interaction/InteractionData";

/**
 * The concept of binding and its related services.
 */
export interface Binding<C extends Command, I extends Interaction<D>, D extends InteractionData> extends FSMHandler {
    /**
     * @returns The interaction.
     */
    getInteraction(): I;

    /**
     * @returns The command in progress or null.
     */
    getCommand(): C | undefined;

    /**
     * @returns True if the binding is activated.
     */
    isActivated(): boolean;

    /**
     * Activates the binding.
     * @param activated - True: the binding is activated. Otherwise, it is desactivated.
     */
    setActivated(activated: boolean): void;

    /**
     * @returns True: if the binding is currently used.
     */
    isRunning(): boolean;

    /**
     * States whether the interaction must continue to run while the condition of the binding is not fulfilled at the interaction start.
     */
    isStrictStart(): boolean;

    uninstallBinding(): void;

    /** An RX observable objects that will provide the commands produced by the binding. */
    produces(): Observable<C>;

    /**
     * Information method.
     * @returns The number of times the binding successfully ended (nevermind a command was created or not).
     */
    getTimesEnded(): number;

    /**
     * Information method.
     * @returns The number of times the binding was cancelled (nevermind a command was created or not).
     */
    getTimesCancelled(): number;
}
