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
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { InteractionData } from "../../interaction/InteractionData";
import { BaseBinderBuilder } from "./BaseBinderBuilder";
import { FSM } from "../../fsm/FSM";
import { LogLevel } from "../../logging/LogLevel";

export interface InteractionBinderBuilder<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
    extends BaseBinderBuilder {
	/**
	 * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
	 * @param whenPredicate The predicate that checks whether the command can be initialised, updated, or executed.
	 * This predicate takes as arguments the ongoing user interaction involved in the binding.
	 * @return The builder to chain the building configuration.
	 */
	when(whenPredicate: (i?: D) => boolean): InteractionBinderBuilder<I, D>;

    on(...widgets: Array<EventTarget>): InteractionBinderBuilder<I, D>;

    end(endFct: () => void): InteractionBinderBuilder<I, D>;

    log(...level: Array<LogLevel>): InteractionBinderBuilder<I, D>;

    // async(): InteractionBinderBuilder<I, D>;

    // help(): InteractionBinderBuilder<I, D>;
}
