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

export interface KeyInteractionBinder<W, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends KeyInteractionBinderBuilder<W, I, D> {

    when(whenPredicate: (i?: D) => boolean): KeyInteractionBinder<W, I, D>;

    on(...widgets: Array<W>): KeyInteractionBinder<W, I, D>;

    log(...level: Array<LogLevel>): KeyInteractionBinder<W, I, D>;

    end(endFct: () => void): KeyInteractionBinder<W, I, D>;

    // async(): KeyInteractionBinder<W, I, D>;

    // help(): KeyInteractionBinder<W, I, D>;

    with(...codes: Array<KeyCode>): KeyInteractionBinder<W, I, D>;

	toProduce<C extends Command>(cmdSupplier: (c: C, i?: D) => void): KeyInteractionCmdBinder<W, C, I, D>;
}
