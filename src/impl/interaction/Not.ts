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

import {ConcurrentInteraction} from "./ConcurrentInteraction";
import {NotFSM} from "../fsm/NotFSM";
import type {Flushable} from "./Flushable";
import type {InteractionBase, InteractionDataImplType} from "./InteractionBase";
import type {FSM} from "../../api/fsm/FSM";
import type {Interaction, InteractionDataType} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {Logger} from "../../api/logging/Logger";
import type {FSMDataHandler} from "../fsm/FSMDataHandler";

/**
 * An interaction that corresponds to the ! operator.
 * DnD ! KeyTyped("ESC")  uses a Not interaction where DnD is the main interaction
 * and KeyTyped the one that can cancel the interactions.
 */
export class Not<I extends InteractionBase<DI & InteractionData, DI & DImpl & Flushable, FSM>, N extends Interaction<InteractionData>,
    DI = InteractionDataType<I>, DImpl = InteractionDataImplType<I>>
    extends ConcurrentInteraction<DI & InteractionData, DI & DImpl & Flushable, NotFSM<FSMDataHandler>> {

    private readonly mainInteraction: I;

    private readonly negInteraction: N;

    public constructor(i1: I, not: N, logger: Logger, name: string) {
        super(new NotFSM(i1.fsm, not.fsm, logger), i1.data as (DI & DImpl & Flushable), logger, name);
        this.mainInteraction = i1;
        this.negInteraction = not;
    }

    public override uninstall(): void {
        this.mainInteraction.uninstall();
        this.negInteraction.uninstall();
        super.uninstall();
    }

    public override reinit(): void {
        this.mainInteraction.reinit();
        this.negInteraction.reinit();
        super.reinit();
    }

    public override fullReinit(): void {
        this.mainInteraction.fullReinit();
        this.negInteraction.fullReinit();
        super.fullReinit();
    }

    public override reinitData(): void {
        this.mainInteraction.reinitData();
        this.negInteraction.reinitData();
        super.reinitData();
    }
}
