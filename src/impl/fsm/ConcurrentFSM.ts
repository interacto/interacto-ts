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

import type {FSM} from "../../api/fsm/FSM";
import type {FSMHandler} from "../../api/fsm/FSMHandler";
import {FSMImpl} from "./FSMImpl";
import type {FSMDataHandler} from "./FSMDataHandler";
import type {Logger} from "../../api/logging/Logger";

/**
 * A concurrent FSM: an FSM that contains multiple FSMs that run concurrently.
 */
export class ConcurrentFSM<F extends FSM, T extends FSMDataHandler> extends FSMImpl<T> {
    /**
     * The main fsms
     */
    private readonly _conccurFSMs: ReadonlyArray<F>;

    /**
     * Secondary fsms. These fsms are not considered to determine whether the interaction has started
     */
    private readonly _secondaryFSMs: ReadonlyArray<F>;

    private readonly totalReinit: boolean;

    /**
     * Creates the FSM
     * @param fsms - The main concurrent FSMs
     * @param secondaries - The secondary FSMs. Not considered in some steps.
     * @param totalReinit - Defines whether a cancellation of one of the fsms, reinits all the fsms.
     */
    public constructor(fsms: ReadonlyArray<F>, logger: Logger, secondaries: ReadonlyArray<F> = [],
                       totalReinit: boolean = false, dataHandler?: T) {
        super(logger, dataHandler);

        this.totalReinit = totalReinit;

        const handler: FSMHandler = {
            "fsmStarts": (): void => {
                if (this.started) {
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
            },
            "fsmError": (err: unknown): void => {
                this.notifyHandlerOnError(err);
            }
        };
        this._conccurFSMs = [...fsms];
        this._secondaryFSMs = [...secondaries];
        for (const fsm of this.conccurFSMs) {
            fsm.addHandler(handler);
        }
    }

    /**
     * @returns All the main and secondary FSMs
     */
    public getAllConccurFSMs(): ReadonlyArray<F> {
        return [...this._conccurFSMs, ...this._secondaryFSMs];
    }

    /**
     * @returns The main FSMs
     */
    public get conccurFSMs(): ReadonlyArray<F> {
        return [...this._conccurFSMs];
    }

    /**
     * @returns The secondary FSMs
     */
    public get secondaryFSMs(): ReadonlyArray<FSM> {
        return [...this._secondaryFSMs];
    }

    public override process(event: Event): boolean {
        return this.getAllConccurFSMs().some(conccurFSM => conccurFSM.process(event));
    }

    public override get started(): boolean {
        return this.conccurFSMs.every(fsm => fsm.started);
    }

    // eslint-disable-next-line accessor-pairs
    public override set log(log: boolean) {
        super.log = log;
        for (const fsm of this.conccurFSMs) {
            fsm.log = log;
        }
        for (const fsm of this.secondaryFSMs) {
            fsm.log = log;
        }
    }

    public override uninstall(): void {
        super.uninstall();
        for (const fsm of this.conccurFSMs) {
            fsm.uninstall();
        }
        for (const fsm of this.secondaryFSMs) {
            fsm.uninstall();
        }
    }

    public override fullReinit(): void {
        if (this.totalReinit) {
            for (const f of this.conccurFSMs) {
                f.fullReinit();
            }
            for (const f of this.secondaryFSMs) {
                f.fullReinit();
            }
        }
        super.fullReinit();
    }

    public override reinit(): void {
        if (this.totalReinit) {
            for (const f of this.conccurFSMs) {
                f.reinit();
            }
            for (const f of this.secondaryFSMs) {
                f.reinit();
            }
        }
        super.reinit();
    }
}
