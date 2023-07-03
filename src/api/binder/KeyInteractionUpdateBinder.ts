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
import type {LogLevel} from "../logging/LogLevel";
import type {Command} from "../command/Command";
import type {KeyInteractionCmdUpdateBinder} from "./KeyInteractionCmdUpdateBinder";
import type {InteractionUpdateBinderBuilder} from "./InteractionUpdateBinderBuilder";
import type {KeyBinderBuilder} from "./KeyBinderBuilder";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {AnonCmd} from "../../impl/command/AnonCmd";
import type {WhenType} from "./When";

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use
 * (for user interactions that can be updated).
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface KeyInteractionUpdateBinder<I extends Interaction<D>, D extends InteractionData, A>
    extends InteractionUpdateBinderBuilder<I, D, A>, KeyBinderBuilder {

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionUpdateBinder<I, D, A>;

    onDynamic(node: Widget<Node>): KeyInteractionUpdateBinder<I, D, A>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionUpdateBinder<I, D, A>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionUpdateBinder<I, D, A>;

    continuousExecution(): KeyInteractionUpdateBinder<I, D, A>;

    throttle(timeout: number): KeyInteractionUpdateBinder<I, D, A>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionUpdateBinder<I, D, A>;

    stopImmediatePropagation(): KeyInteractionUpdateBinder<I, D, A>;

    preventDefault(): KeyInteractionUpdateBinder<I, D, A>;

    cancel(fn: (i: D, acc: A) => void): KeyInteractionUpdateBinder<I, D, A>;

    endOrCancel(fn: (i: D, acc: A) => void): KeyInteractionUpdateBinder<I, D, A>;

    catch(fn: (ex: unknown) => void): KeyInteractionUpdateBinder<I, D, A>;

    name(name: string): KeyInteractionUpdateBinder<I, D, A>;

    toProduce<C extends Command>(fn: (i: D) => C): KeyInteractionCmdUpdateBinder<C, I, D, A>;

    toProduceAnon(fn: () => void): KeyInteractionCmdUpdateBinder<AnonCmd, I, D, A>;
}
