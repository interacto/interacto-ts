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

import {FSMImpl} from "./FSMImpl";
import type {FSMDataHandler} from "./FSMDataHandler";
import type {ConcurrentFSM} from "../../api/fsm/ConcurrentFSM";
import type {FSM} from "../../api/fsm/FSM";
import type {FSMHandler} from "../../api/fsm/FSMHandler";
import type {VisitorFSM} from "../../api/fsm/VisitorFSM";
import type {Logger} from "../../api/logging/Logger";

/**
 * A concurrent FSM: an FSM that contains multiple FSMs where only one of them can run at
 * the same time. This is thus a XOR concurrent FSM.
 * If one FSM has started, the other ones cannot start.
 */
export class ConcurrentXOrFSM<F extends FSM, T extends FSMDataHandler> extends FSMImpl<T> implements ConcurrentFSM<F> {
    /**
     * The main fsms
     */
    private readonly _conccurFSMs: ReadonlyArray<F>;

    /**
     * Creates the FSM
     * @param fsms - The main concurrent FSMs
     * @param logger - The logger to use for logging FSM messages
     * @param dataHandler - The data handler the FSM will use
     */
    public constructor(fsms: ReadonlyArray<F>, logger: Logger, dataHandler?: T) {
        // eslint-disable-next-line no-console
        console.log(new Set(fsms.map(fsm => fsm.constructor.name)));
        if (new Set(fsms.map(fsm => fsm.constructor.name)).size !== fsms.length) {
            throw new Error("Cannot create an XOR interaction using two interactions of the same type");
        }

        super(logger, dataHandler);

        const handler: FSMHandler = {
            "fsmStarts": (): void => {
                this.onStarting();
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
        this._conccurFSMs = Array.from(fsms);
        for (const fsm of this._conccurFSMs) {
            fsm.addHandler(handler);
        }
    }

    public override process(event: Event): boolean {
        const startedFSM = this._conccurFSMs.find(fsm => fsm.started);
        if (startedFSM === undefined) {
            return this._conccurFSMs.some(conccurFSM => conccurFSM.process(event));
        }
        return startedFSM.process(event);
    }

    public getAllConccurFSMs(): ReadonlyArray<F> {
        return Array.from(this._conccurFSMs);
    }

    public override get started(): boolean {
        return this._conccurFSMs.some(fsm => fsm.started);
    }

    // eslint-disable-next-line accessor-pairs
    public override set log(log: boolean) {
        super.log = log;
        for (const fsm of this._conccurFSMs) {
            fsm.log = log;
        }
    }

    public override uninstall(): void {
        super.uninstall();
        for (const fsm of this._conccurFSMs) {
            fsm.uninstall();
        }
    }

    public override fullReinit(): void {
        for (const f of this._conccurFSMs) {
            f.fullReinit();
        }
        super.fullReinit();
    }

    public override reinit(): void {
        for (const f of this._conccurFSMs) {
            f.reinit();
        }
        super.reinit();
    }

    public override acceptVisitor(visitor: VisitorFSM): void {
        visitor.visitXOrConcurrentFSM(this);
    }
}
