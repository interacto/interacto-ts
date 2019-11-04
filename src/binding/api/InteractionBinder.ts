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
import { FSM } from "../../fsm/FSM";
import { InteractionData } from "../../interaction/InteractionData";
import { InteractionBinderBuilder } from "./InteractionBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { Command } from "../../command/Command";
import { InteractionCmdBinder } from "./InteractionCmdBinder";


export interface InteractionBinder<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionBinderBuilder<I, D> {

    when(whenPredicate: (i?: D) => boolean): InteractionBinder<I, D>;

    on(...widgets: Array<EventTarget>): InteractionBinder<I, D>;

	log(...level: Array<LogLevel>): InteractionBinder<I, D>;

	end(endFct: () => void): InteractionBinder<I, D>;

	// async(): InteractionBinder<I, D>;

	// help(): InteractionBinder<I, D>;

	toProduce<C extends Command>(cmdSupplier: (d?: D) => C): InteractionCmdBinder<C, I, D>;
}
