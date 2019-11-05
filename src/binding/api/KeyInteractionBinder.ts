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
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { InteractionData } from "../../interaction/InteractionData";
import { KeyInteractionBinderBuilder } from "./KeyInteractionBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { KeyCode } from "../../fsm/Events";
import { Command } from "../../command/Command";
import { KeyInteractionCmdBinder } from "./KeyInteractionCmdBinder";

export interface KeyInteractionBinder<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends KeyInteractionBinderBuilder<I, D> {

    when(whenPredicate: (i?: D) => boolean): KeyInteractionBinder<I, D>;

    on(...widgets: Array<EventTarget>): KeyInteractionBinder<I, D>;

    log(...level: Array<LogLevel>): KeyInteractionBinder<I, D>;

    end(endFct: () => void): KeyInteractionBinder<I, D>;

    // async(): KeyInteractionBinder<I, D>;

    // help(): KeyInteractionBinder<I, D>;

    with(...codes: Array<KeyCode>): KeyInteractionBinder<I, D>;

	toProduce<C extends Command>(cmdSupplier: (i?: D) => C): KeyInteractionCmdBinder<C, I, D>;
}
