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
import { LogLevel } from "../../logging/LogLevel";
import { Command } from "../../command/Command";
import { InteractionData } from "../../interaction/InteractionData";
import { InteractionImpl } from "../../interaction/InteractionImpl";
import { BaseBinderBuilder } from "./BaseBinderBuilder";
import { FSM } from "../../fsm/FSM";
import { InteractionBinder } from "./InteractionBinder";
import { CmdBinder } from "./CmdBinder";

export interface BaseBinder extends BaseBinderBuilder {
    on(...widgets: Array<EventTarget>): BaseBinder;

    when(whenPredicate: () => boolean): BaseBinder;

    end(endFct: () => void): BaseBinder;

    log(...level: Array<LogLevel>): BaseBinder;

    // async(): BaseBinder;

    // help(): BaseBinder;

    toProduce<C extends Command>(cmdSupplier: () => C): CmdBinder<C>;

    usingInteraction<I extends InteractionImpl<D, FSM, {}>, D extends InteractionData>(interactionSupplier: () => I): InteractionBinder<I, D>;
}
