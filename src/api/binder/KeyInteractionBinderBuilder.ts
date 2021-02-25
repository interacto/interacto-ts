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
import type {InteractionData} from "../interaction/InteractionData";
import type {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import type {KeyBinderBuilder} from "./KeyBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";


export interface KeyInteractionBinderBuilder<I extends Interaction<D>, D extends InteractionData>
    extends InteractionBinderBuilder<I, D>, KeyBinderBuilder {

    when(fn: (i: D) => boolean): KeyInteractionBinderBuilder<I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeyInteractionBinderBuilder<I, D>;

    onDynamic(node: Widget<Node>): KeyInteractionBinderBuilder<I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionBinderBuilder<I, D>;

    end(fn: () => void): KeyInteractionBinderBuilder<I, D>;

    with(...codes: ReadonlyArray<string>): KeyInteractionBinderBuilder<I, D>;

    stopImmediatePropagation(): KeyInteractionBinderBuilder<I, D>;

    preventDefault(): KeyInteractionBinderBuilder<I, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionBinderBuilder<I, D>;
}
