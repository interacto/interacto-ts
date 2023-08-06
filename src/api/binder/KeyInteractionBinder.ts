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
import type {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {KeyInteractionCmdBinder} from "./KeyInteractionCmdBinder";
import type {Interaction, InteractionDataType} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {AnonCmd} from "../../impl/command/AnonCmd";
import type {WhenType} from "./When";

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use.
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface KeyInteractionBinder<I extends Interaction<D>, A, D extends InteractionData = InteractionDataType<I>>
    extends KeyInteractionBinderBuilder<I, A, D> {

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionBinder<I, A, D>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionBinder<I, A, D>;

    onDynamic(node: Widget<Node>): KeyInteractionBinder<I, A, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionBinder<I, A, D>;

    end(fn: () => void): KeyInteractionBinder<I, A, D>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionBinder<I, A, D>;

    stopImmediatePropagation(): KeyInteractionBinder<I, A, D>;

    preventDefault(): KeyInteractionBinder<I, A, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionBinder<I, A, D>;

    name(name: string): KeyInteractionBinder<I, A, D>;

    toProduce<C extends Command>(fn: (i: D) => C): KeyInteractionCmdBinder<C, I, A, D>;

    toProduceAnon(fn: () => void): KeyInteractionCmdBinder<AnonCmd, I, A, D>;
}
