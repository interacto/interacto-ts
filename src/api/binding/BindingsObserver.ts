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

import type {Binding} from "./Binding";
import type {Checker} from "../checker/Checker";
import type {Command} from "../command/Command";
import type {Interaction} from "../interaction/Interaction";

/**
 * Permits to observe the bindings produced using `Bindings` routines.
 * @category API Binding
 */
export interface BindingsObserver {
    /**
     * Adds a binding to observe.
     * @param binding - The binding to observe.
     */
    observeBinding(binding: Binding<Command, Interaction<object>, unknown>): void;

    /**
     * Clear all the observed bindings and uninstall them.
     */
    clearObservedBindings(): void;

    /**
     * The type checker of the current context.
     */
    readonly checker: Checker;
}
