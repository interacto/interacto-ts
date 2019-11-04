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
import { KeyBinderBuilder } from "./KeyBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";
import { KeyCode } from "../../fsm/Events";


export interface KeyInteractionBinderBuilder<W, I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>
        extends InteractionBinderBuilder<W, I, D>, KeyBinderBuilder<W> {

    when(whenPredicate: (i?: D) => boolean): KeyInteractionBinderBuilder<W, I, D>;

    on(...widgets: Array<W>): KeyInteractionBinderBuilder<W, I, D>;

    log(...level: Array<LogLevel>): KeyInteractionBinderBuilder<W, I, D>;

    // async(): KeyInteractionBinderBuilder<W, I, D>;

    end(endFct: () => void): KeyInteractionBinderBuilder<W, I, D>;

    // help(): KeyInteractionBinderBuilder<W, I, D>;

    with(...codes: Array<KeyCode>): KeyInteractionBinderBuilder<W, I, D>;
}
