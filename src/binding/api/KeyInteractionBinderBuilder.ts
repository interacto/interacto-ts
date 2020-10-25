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
import {FSM} from "../../fsm/FSM";
import {InteractionData} from "../../interaction/InteractionData";
import {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import {KeyBinderBuilder} from "./KeyBinderBuilder";
import {LogLevel} from "../../logging/LogLevel";
import {Interaction} from "../../interaction/Interaction";


export interface KeyInteractionBinderBuilder<I extends Interaction<D, FSM>, D extends InteractionData>
    extends InteractionBinderBuilder<I, D>, KeyBinderBuilder {

    when(whenPredicate: (i: D) => boolean): KeyInteractionBinderBuilder<I, D>;

    on(...widgets: Array<EventTarget>): KeyInteractionBinderBuilder<I, D>;

    onDynamic(node: Node): KeyInteractionBinderBuilder<I, D>;

    log(...level: Array<LogLevel>): KeyInteractionBinderBuilder<I, D>;

    end(endFct: () => void): KeyInteractionBinderBuilder<I, D>;

    with(...codes: Array<string>): KeyInteractionBinderBuilder<I, D>;

    stopImmediatePropagation(): KeyInteractionBinderBuilder<I, D>;

    preventDefault(): KeyInteractionBinderBuilder<I, D>;
}
