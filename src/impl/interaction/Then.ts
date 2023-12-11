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

import {InteractionBase} from "./InteractionBase";
import {ThenDataImpl} from "./ThenDataImpl";
import {ThenFSM} from "../fsm/ThenFSM";
import type {Flushable} from "./Flushable";
import type {FSM} from "../../api/fsm/FSM";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {ThenData} from "../../api/interaction/ThenData";
import type {Logger} from "../../api/logging/Logger";

/**
 * A user interaction composed of a serie of sub user interactions.
 */
export class Then<IX extends Array<InteractionBase<InteractionData, Flushable & InteractionData, FSM>>,
    DX extends Array<unknown>,
    DXImpl extends Array<Flushable> & DX>
    extends InteractionBase<ThenData<DX>, ThenDataImpl<DXImpl>, FSM> {

    private readonly ix: IX;

    public constructor(ix: IX, logger: Logger) {
        super(new ThenFSM(ix.map(inter => inter.fsm), logger),
            new ThenDataImpl(ix.map(inter => inter.data) as unknown as DXImpl), logger, "");
        this.ix = ix;
    }

    public override uninstall(): void {
        super.uninstall();
        for (const inter of this.ix) {
            inter.uninstall();
        }
    }

    public override reinit(): void {
        super.reinit();
        for (const inter of this.ix) {
            inter.reinit();
        }
    }

    public override fullReinit(): void {
        super.fullReinit();
        for (const inter of this.ix) {
            inter.fullReinit();
        }
    }

    public override reinitData(): void {
        super.reinitData();
        for (const inter of this.ix) {
            inter.reinitData();
        }
    }
}
