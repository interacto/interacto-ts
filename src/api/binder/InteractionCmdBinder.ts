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
import type {CmdBinderBuilder} from "./CmdBinderBuilder";
import type {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import type {LogLevel} from "../logging/LogLevel";
import type {Binding} from "../binding/Binding";
import type {Interaction} from "../interaction/Interaction";
import type {Widget} from "./BaseBinderBuilder";
import type {WhenType} from "./When";

/**
 * The binder API that already knows the type of UI command and the user interaction to use.
 * @typeParam C - The type of the produced UI commands
 * @typeParam I - The type of the user interaction
 * @typeParam D - The type of the interaction data of the user interaction
 */
export interface InteractionCmdBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends CmdBinderBuilder<C>, InteractionBinderBuilder<I, D> {
    /**
     * Specifies the initialisation of the command when the interaction starts.
     * Each time the interaction starts, an instance of the command is created and configured by the given callback.
     * A binder can have several cummulative 'first' routines.
     * @param fn - The callback method that initialises the command.
     * This callback takes as arguments both the command and interaction data involved in the binding.
     * @returns The binder to chain the building configuration.
     */
    first(fn: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    /**
     * Specifies what to do end when an interaction ends (after the end/endOrCancel routines) and the command has produced an effect.
     * A binder can have several cummulative 'ifHadEffects' routines.
     * @param fn - The callback method to specify what to do when an interaction ends and the command produced an effect.
     * @returns The binder to chain the building configuration.
     */
    ifHadEffects(fn: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    /**
     * Specifies what to do end when an interaction ends (after the end/endOrCancel routines) and the command did not produce an effect.
     * A binder can have several cummulative 'ifHadNoEffect' routines.
     * @param fn - The callback method to specify what to do when an interaction ends and the command did not produce an effect.
     * @returns The binder to chain the building configuration.
     */
    ifHadNoEffect(fn: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    /**
     * Specifies what to do end when an interaction ends and the command could not be executed.
     * A binder can have several cummulative 'ifCannotExecute' routines.
     * @param fn - The callback method to specify what to do when an interaction ends and the command could not be executed.
     * @returns The binder to chain the building configuration.
     */
    ifCannotExecute(fn: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    /**
     * Specifies what to do end when an interaction ends (when the last event of the interaction has occurred, but just after
     * the interaction is reinitialised and the command finally executed and discarded / saved).
     * A binder can have several cummulative 'end' routines.
     * @param fn - The callback method to specify what to do when an interaction ends.
     * @returns The binder to chain the building configuration.
     */
    end(fn: (c: C, i: D) => void): InteractionCmdBinder<C, I, D>;

    on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    InteractionCmdBinder<C, I, D>;

    onDynamic(node: Widget<Node>): InteractionCmdBinder<C, I, D>;

    log(...level: ReadonlyArray<LogLevel>): InteractionCmdBinder<C, I, D>;

    when(fn: (i: D) => boolean, mode?: WhenType): InteractionCmdBinder<C, I, D>;

    stopImmediatePropagation(): InteractionCmdBinder<C, I, D>;

    preventDefault(): InteractionCmdBinder<C, I, D>;

    catch(fn: (ex: unknown) => void): InteractionCmdBinder<C, I, D>;

    name(name: string): InteractionCmdBinder<C, I, D>;

    /**
     * Executes the binder to create and install an Interacto binding.
     */
    bind(): Binding<C, I, D>;
}
