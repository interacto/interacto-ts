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
import {ConcurrentXOrFSM} from "../fsm/ConcurrentXOrFSM";
import type {Flushable} from "./Flushable";
import type {InteractionBase, InteractionDataImplType} from "./InteractionBase";
import type {FSM} from "../../api/fsm/FSM";
import type {InteractionDataType} from "../../api/interaction/Interaction";
import type {Logger} from "../../api/logging/Logger";
import type {FSMDataHandler} from "../fsm/FSMDataHandler";

/**
 * The Or user interaction. This is an XOr. Either one of the two interactions
 * can run at a given instant.
 * @typeParam I1 - The type of the first interaction
 * @typeParam I2 - The type of the second interaction
 * @typeParam D1 - The type of the first interaction data
 * @typeParam D1Impl - The class of the first interaction data
 * @typeParam D2Impl - The class of the second interaction data
 * @category Interaction Library
 */
export class Or<
    I1 extends InteractionBase<D1, D1Impl>,
    I2 extends InteractionBase<D2, D2Impl>,
    D1 extends object = InteractionDataType<I1>,
    D2 extends object = InteractionDataType<I2>,
    D1Impl extends D1 & Flushable = InteractionDataImplType<I1>,
    D2Impl extends D2 & Flushable = InteractionDataImplType<I2>>
    extends ConcurrentInteraction<D1 | D2, D1Impl | D2Impl, ConcurrentXOrFSM<FSM>> {
    private readonly i1: I1;

    private readonly i2: I2;

    public constructor(i1: I1, i2: I2, logger: Logger) {
        const handler: FSMDataHandler = {
            "reinitData": () => {}
        };
        super(new ConcurrentXOrFSM([i1.fsm, i2.fsm], logger, handler), {
            "flush": () => {}
        } as D1Impl | D2Impl, logger, `${i1.name}-${i2.name}`);
        this.i1 = i1;
        this.i2 = i2;
    }

    public override get data(): D1 | D2 {
        return this.i1.fsm.started ? this.i1.data : this.i2.data;
    }

    public override uninstall(): void {
        this.i1.uninstall();
        this.i2.uninstall();
    }

    public override reinit(): void {
        this.i1.reinit();
        this.i2.reinit();
        super.reinit();
    }

    public override fullReinit(): void {
        this.i1.fullReinit();
        this.i2.fullReinit();
        super.fullReinit();
    }

    public override reinitData(): void {
        this.i1.reinitData();
        this.i2.reinitData();
        super.reinitData();
    }
}
