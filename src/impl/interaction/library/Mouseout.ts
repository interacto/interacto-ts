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

import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";
import {MouseoutTransition} from "../../fsm/MouseoutTransition";
import type {TransitionBase} from "../../fsm/TransitionBase";
import {MouseleaveTransition} from "../../fsm/MouseleaveTransition";

/**
 * The FSM for mouseout interactions
 */
export class MouseoutFSM extends FSMImpl {
    /**
     * Indicates if event bubbling is enabled for the interaction
     */
    private readonly withBubbling: boolean;

    /**
     * Creates the FSM
     */
    public constructor(withBubbling: boolean) {
        super();
        this.withBubbling = withBubbling;
    }

    public override buildFSM(dataHandler?: MouseoutFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const exited = new TerminalState(this, "exited");
        this.addState(exited);

        let exit: TransitionBase<MouseEvent>;
        if (this.withBubbling) {
            exit = new MouseoutTransition(this.initState, exited);
        } else {
            exit = new MouseleaveTransition(this.initState, exited);
        }
        exit.action = (event: MouseEvent): void => {
            dataHandler?.onExit(event);
        };
    }
}

interface MouseoutFSMHandler extends FSMDataHandler {
    onExit(event: MouseEvent): void;
}

export class Mouseout extends InteractionBase<PointData, PointDataImpl, MouseoutFSM> {
    private readonly handler: MouseoutFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(withBubbling: boolean) {
        super(new MouseoutFSM(withBubbling), new PointDataImpl());

        this.handler = {
            "onExit": (evt: MouseEvent): void => {
                this._data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.fsm.buildFSM(this.handler);
    }
}
