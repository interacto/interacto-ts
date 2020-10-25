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
import {FSM} from "../fsm/FSM";
import {InteractionData} from "../interaction/InteractionData";
import {InteractionBinderBuilder} from "./InteractionBinderBuilder";
import {LogLevel} from "../logging/LogLevel";
import {Interaction} from "../interaction/Interaction";


export interface InteractionUpdateBinderBuilder<I extends Interaction<D, FSM>, D extends InteractionData>
    extends InteractionBinderBuilder <I, D> {
    /**
    * Defines what to do when a command is cancelled (because the interaction is cancelled).
    * The undoable command is automatically cancelled so that nothing must be done on the command.
    * @return The builder to chain the building configuration.
    */
    cancel(cancel: (i: D) => void): InteractionUpdateBinderBuilder<I, D>;

    /**
    * Defines what to do when a command is cancelled (because the interaction is cancelled).
    * The undoable command is automatically cancelled so that nothing must be done on the command.
    * @return The builder to chain the building configuration.
    */
    endOrCancel(endOrCancel: (i: D) => void): InteractionUpdateBinderBuilder<I, D>;

    when(whenPredicate: (i: D) => boolean): InteractionUpdateBinderBuilder<I, D>;

    end(endFct: () => void): InteractionUpdateBinderBuilder<I, D>;

    on(...widgets: Array<EventTarget>): InteractionUpdateBinderBuilder<I, D>;

    onDynamic(node: Node): InteractionUpdateBinderBuilder<I, D>;

    log(...level: Array<LogLevel>): InteractionUpdateBinderBuilder<I, D>;

    stopImmediatePropagation(): InteractionUpdateBinderBuilder<I, D>;

    preventDefault(): InteractionUpdateBinderBuilder<I, D>;
}
