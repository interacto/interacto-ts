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

import {FSM} from "../../api/fsm/FSM";
import {FSMHandler} from "../../api/fsm/FSMHandler";
import {FSMImpl} from "./FSMImpl";

/**
 * A concurrent FSM: an FSM that contains multiple FSMs that run concurrently.
 */
export class ConcurrentFSM<F extends FSM> extends FSMImpl {
    private readonly conccurFSMs: Array<F>;

    public constructor(fsms: Array<F>) {
        super();
        if (fsms.length < 2) {
            throw new Error(`Requires more that 1 FSM: ${String(fsms)}`);
        }

        const handler: FSMHandler = {
            "fsmStarts": (): void => {
                if (this.isStarted()) {
                    this.onStarting();
                }
            },
            "fsmUpdates": (): void => {
                this.onUpdating();
            },
            "fsmStops": (): void => {
                this.onTerminating();
            },
            "fsmCancels": (): void => {
                this.onCancelling();
            }
        };
        this.conccurFSMs = [...fsms];
        this.conccurFSMs.forEach(fsm => fsm.addHandler(handler));
    }

    /**
     * @return All the FSMs in an copy of the original array.
     */
    public getConccurFSMs(): Array<F> {
        return [...this.conccurFSMs];
    }

    public process(event: Event): boolean {
        return this.conccurFSMs.some(conccurFSM => conccurFSM.process(event));
    }

    public isStarted(): boolean {
        return this.conccurFSMs.every(fsm => fsm.isStarted());
    }

    public log(log: boolean): void {
        super.log(log);
        this.conccurFSMs.forEach(fsm => fsm.log(log));
    }

    public uninstall(): void {
        super.uninstall();
        this.conccurFSMs.forEach(fsm => fsm.uninstall());
    }
}
