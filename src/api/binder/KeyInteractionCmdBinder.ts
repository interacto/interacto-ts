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

/**
 * The binder API for key-based user interactions, that already knows the type of the user interaction to use and
 * the type of command the binding will produce.
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface KeyInteractionCmdBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends KeyInteractionBinderBuilder<I, D>, InteractionCmdBinder<C, I, D> {

    first(fn: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeyInteractionCmdBinder<C, I, D>;

    onDynamic(node: Widget<Node>): KeyInteractionCmdBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): KeyInteractionCmdBinder<C, I, D>;

    when(fn: (i: D) => boolean): KeyInteractionCmdBinder<C, I, D>;

    ifHadEffects(fn: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    ifHadNoEffect(fn: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    ifCannotExecute(fn: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    end(fn: (c: C, i: D) => void): KeyInteractionCmdBinder<C, I, D>;

    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyInteractionCmdBinder<C, I, D>;

    stopImmediatePropagation(): KeyInteractionCmdBinder<C, I, D>;

    preventDefault(): KeyInteractionCmdBinder<C, I, D>;

    catch(fn: (ex: unknown) => void): KeyInteractionCmdBinder<C, I, D>;

    name(name: string): KeyInteractionCmdBinder<C, I, D>;

    bind(): Binding<C, I, D>;
}
