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
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";

/**
 * The binding builder API for key-based user interactions,
 * that already knows the type of user interaction the bindings will use.
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface KeyInteractionBinderBuilder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends InteractionBinderBuilder<I, A, D>, KeyBinderBuilder {

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionBinderBuilder<I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionBinderBuilder<I, A, D>;

    onDynamic(node: Widget<Node>): KeyInteractionBinderBuilder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionBinderBuilder<I, A, D>;

    end(fn: () => void): KeyInteractionBinderBuilder<I, A, D>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionBinderBuilder<I, A, D>;

    stopImmediatePropagation(): KeyInteractionBinderBuilder<I, A, D>;

    preventDefault(): KeyInteractionBinderBuilder<I, A, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionBinderBuilder<I, A, D>;

    name(name: string): KeyInteractionBinderBuilder<I, A, D>;
}
