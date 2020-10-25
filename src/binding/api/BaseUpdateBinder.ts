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
import {BaseUpdateBinderBuilder} from "./BaseUpdateBinderBuilder";
import {LogLevel} from "../../logging/LogLevel";
import {Command} from "../../command/Command";
import {FSM} from "../../fsm/FSM";
import {InteractionData} from "../../interaction/InteractionData";
import {CmdUpdateBinder} from "./CmdUpdateBinder";
import {InteractionUpdateBinder} from "./InteractionUpdateBinder";
import {BaseBinder} from "./BaseBinder";
import {Interaction} from "../../interaction/Interaction";

/**
 * The base interface for building widget bindings based on non-trivial user interactions (eg DnD) with routines
 * for defining the UI command and the user interaction to use.
 */
export interface BaseUpdateBinder extends BaseUpdateBinderBuilder, BaseBinder {
    on(...widgets: Array<EventTarget>): BaseUpdateBinder;

    onDynamic(node: Node): BaseUpdateBinder;

    when(whenPredicate: () => boolean): BaseUpdateBinder;

    end(endFct: () => void): BaseUpdateBinder;

    log(...level: Array<LogLevel>): BaseUpdateBinder;

    continuousExecution(): BaseUpdateBinder;

    strictStart(): BaseUpdateBinder;

    throttle(timeout: number): BaseUpdateBinder;

    toProduce<C extends Command>(cmdSupplier: () => C): CmdUpdateBinder<C>;

    usingInteraction<I extends Interaction<D, FSM>, D extends InteractionData>
    (interactionSupplier: () => I): InteractionUpdateBinder<I, D>;

    stopImmediatePropagation(): BaseUpdateBinder;

    preventDefault(): BaseUpdateBinder;
}
