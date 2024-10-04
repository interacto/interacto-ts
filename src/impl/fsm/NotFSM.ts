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

import {CancelFSMError} from "./CancelFSMError";
import {ConcurrentAndFSM} from "./ConcurrentAndFSM";
import type {FSM} from "../../api/fsm/FSM";
import type {Logger} from "../../api/logging/Logger";

/**
 * An FSM that corresponds to the ! operator.
 * DnD ! KeyTyped("ESC")  uses a NotFSM where DnD gives is the main FSM
 * and KeyTyped the FSM that can cancel the FSMs.
 * @category FSM
 */
export class NotFSM extends ConcurrentAndFSM<FSM> {
    private readonly mainFSM: FSM;

    public constructor(mainFSM: FSM, negFSM: FSM, logger: Logger) {
        super([mainFSM], logger, [negFSM]);
        this.mainFSM = mainFSM;

        negFSM.addHandler({
            "fsmStops": () => {
                this.mainFSM.onCancelling();
                throw new CancelFSMError();
            }
        });
    }
}
