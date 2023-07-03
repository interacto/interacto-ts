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
import type {Command} from "../command/Command";
import type {InteractionData} from "../interaction/InteractionData";
import type {KeyInteractionBinderBuilder} from "./KeyInteractionBinderBuilder";
import type {InteractionCmdBinder} from "./InteractionCmdBinder";
import type {LogLevel} from "../logging/LogLevel";
import type {Binding} from "../binding/Binding";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use and
 * the type of command the binding will produce.
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface KeyInteractionCmdBinder<C extends Command, I extends Interaction<D>, D extends InteractionData, A>
    extends KeyInteractionBinderBuilder<I, D, A>, InteractionCmdBinder<C, I, D, A> {

    first(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdBinder<C, I, D, A>;

    on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeyInteractionCmdBinder<C, I, D, A>;

    onDynamic(node: Widget<Node>): KeyInteractionCmdBinder<C, I, D, A>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionCmdBinder<C, I, D, A>;

    when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): KeyInteractionCmdBinder<C, I, D, A>;

    ifHadEffects(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdBinder<C, I, D, A>;

    ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdBinder<C, I, D, A>;

    ifCannotExecute(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdBinder<C, I, D, A>;

    end(fn: (c: C, i: D, acc: A) => void): KeyInteractionCmdBinder<C, I, D, A>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionCmdBinder<C, I, D, A>;

    stopImmediatePropagation(): KeyInteractionCmdBinder<C, I, D, A>;

    preventDefault(): KeyInteractionCmdBinder<C, I, D, A>;

    catch(fn: (ex: unknown) => void): KeyInteractionCmdBinder<C, I, D, A>;

    name(name: string): KeyInteractionCmdBinder<C, I, D, A>;

    bind(): Binding<C, I, D, A>;
}
