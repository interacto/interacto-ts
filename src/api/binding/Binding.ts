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

import type {Interaction} from "../interaction/Interaction";
import type {Command} from "../command/Command";
import type {Observable} from "rxjs";
import type {InteractionData} from "../interaction/InteractionData";

/**
 * The concept of binding and its related services.
 */
export interface Binding<C extends Command, I extends Interaction<D>, D extends InteractionData> {
    /**
     * The name of the binding
     */
    readonly name: string;

    /**
     * Logs (or not) usage information of the binding for usage analysis
     */
    logUsage: boolean;

    /**
     * Logs (or not) binding execution information.
     */
    logBinding: boolean;

    /**
     * Logs (or not) command production information
     */
    logCmd: boolean;

    /**
     * The user interaction.
     */
    readonly interaction: I;

    /**
     * The command in progress or null.
     */
    readonly command: C | undefined;

    /**
     * States whether the binding is activated.
     */
    activated: boolean;

    /**
     * States whether the binding is running.
     */
    readonly running: boolean;

    /**
     * States whether the interaction must continue to run while the condition of the binding is not fulfilled at the interaction start.
     */
    readonly strictStart: boolean;

    /**
     * States whether the command must be executed on each step of the interaction (and not only at the
     * end of the interaction execution).
     */
    readonly continuousCmdExecution: boolean;

    /**
     * Information method.
     * @returns The number of times the binding successfully ended (nevermind a command was created or not).
     */
    readonly timesEnded: number;

    /**
     * Information method.
     * The number of times the binding was cancelled (nevermind a command was created or not).
     */
    readonly timesCancelled: number;

    /** An RX observable objects that will provide the commands produced by the binding. */
    readonly produces: Observable<C>;

    uninstallBinding(): void;
}
