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
import {InteractionData} from "../interaction/InteractionData";
import {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import {KeyBinderBuilder} from "./KeyBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Interaction} from "../interaction/Interaction";
import {Widget} from "./BaseBinderBuilder";


export interface KeyInteractionBinderBuilder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionBinderBuilder<I, D>, KeyBinderBuilder {

    when(whenPredicate: (i: D) => boolean): KeyInteractionBinderBuilder<I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeyInteractionBinderBuilder<I, D>;

    onDynamic(node: Widget<Node>): KeyInteractionBinderBuilder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionBinderBuilder<I, D>;

    end(endFct: () => void): KeyInteractionBinderBuilder<I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionBinderBuilder<I, D>;

    stopImmediatePropagation(): KeyInteractionBinderBuilder<I, D>;

    preventDefault(): KeyInteractionBinderBuilder<I, D>;
}
