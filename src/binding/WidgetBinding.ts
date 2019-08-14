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

import {FSMHandler} from "../fsm/FSMHandler";
import {InteractionImpl} from "../interaction/InteractionImpl";
import {FSM} from "../fsm/FSM";
import {Command} from "../command/Command";

/**
 * The concept of widget binding and its related services.
 * @author Arnaud BLOUIN
 */
export interface WidgetBinding extends FSMHandler {
    /**
     * Stops the interaction and clears all its events waiting for a process.
     */
    clearEvents(): void;

    /**
     * After being created by method map, the command must be initialised by this method.
     */
    first(): void;

    /**
     * Updates the current command. To override.
     */
    then(): void;

    /**
     * @return {boolean} True if the condition of the widget binding is respected.
     */
    when(): boolean;

    /**
     * @return {InteractionImpl} The interaction.
     */
    getInteraction(): InteractionImpl<{}, FSM, {}>;

    /**
     * @return {*} The command in progress or null.
     */
    getCommand(): Command | undefined;

    /**
     * @return {boolean} True if the widget binding is activated.
     */
    isActivated(): boolean;

    /**
     * Activates the widget binding.
     * @param {boolean} activ True: the widget binding is activated. Otherwise, it is desactivated.
     */
    setActivated(activ: boolean): void;

    /**
     * @return {boolean} True: if the widget binding is currently used.
     */
    isRunning(): boolean;

    /**
     * States whether the interaction must continue to run while the condition of the binding is not fulfilled at the interaction start.
     * @return {boolean}
     */
    isStrictStart(): boolean;

    /**
     * @return {boolean} True if the command is executed on each evolution of the interaction.
     */
    isExecute(): boolean;

    /**
     * Defines the interim feedback of the widget binding. If overridden, the interim
     * feedback of its instrument should be define too.
     */
    feedback(): void;

    uninstallBinding(): void;
}
