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
import { Command } from "../../command/Command";
import { CmdUpdateBinderBuilder } from "./CmdUpdateBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { FSM } from "../../fsm/FSM";
import { InteractionData } from "../../interaction/InteractionData";
import { InteractionCmdUpdateBinder } from "./InteractionCmdUpdateBinder";

export interface CmdUpdateBinder<W, C extends Command> extends CmdUpdateBinderBuilder<W, C> {
	then(update: (c: C) => void): CmdUpdateBinder<W, C>;

	continuousExecution(): CmdUpdateBinder<W, C>;

	strictStart(): CmdUpdateBinder<W, C>;

	throttle(timeout: number): CmdUpdateBinder<W, C>;

	first(initCmdFct: (c: C) => void): CmdUpdateBinder<W, C>;

	on(...widgets: Array<W>): CmdUpdateBinder<W, C>;

    when(whenPredicate: () => boolean): CmdUpdateBinder<W, C>;

	log(...level: Array<LogLevel>): CmdUpdateBinder<W, C>;

	// async(): CmdUpdateBinder<W, C>;

	// help(): CmdUpdateBinder<W, C>;

    end(endFct: (c?: C) => void): CmdUpdateBinder<W, C>;

    usingInteraction<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        (interactionSupplier: () => I): InteractionCmdUpdateBinder<W, C, I, D>;
}
