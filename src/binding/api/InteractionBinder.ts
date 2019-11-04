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


export interface InteractionBinder<W, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionBinderBuilder<W, I, D> {

    when(whenPredicate: (i?: D) => boolean): InteractionBinder<W, I, D>;

    on(...widgets: Array<W>): InteractionBinder<W, I, D>;

	log(...level: Array<LogLevel>): InteractionBinder<W, I, D>;

	end(endFct: () => void): InteractionBinder<W, I, D>;

	async(): InteractionBinder<W, I, D>;

	help(): InteractionBinder<W, I, D>;

	toProduce<C extends Command>(cmdSupplier: (d?: D) => C): InteractionCmdBinder<W, C, I, D>;
}
