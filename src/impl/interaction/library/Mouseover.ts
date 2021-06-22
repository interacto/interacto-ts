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
import {MouseoverTransition} from "../../fsm/MouseoverTransition";
import {MouseenterTransition} from "../../fsm/MouseenterTransition";
import type {TransitionBase} from "../../fsm/TransitionBase";

/**
 * The FSM for mouseover interactions
 */
export class MouseoverFSM extends FSMImpl {
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

    public override buildFSM(dataHandler?: MouseoverFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const entered = new TerminalState(this, "entered");
        this.addState(entered);

        let enter: TransitionBase<MouseEvent>;
        if (this.withBubbling) {
            enter = new MouseoverTransition(this.initState, entered);
        } else {
            enter = new MouseenterTransition(this.initState, entered);
        }
        enter.action = (event: MouseEvent): void => {
            dataHandler?.onEnter(event);
        };
    }
}

interface MouseoverFSMHandler extends FSMDataHandler {
    onEnter(event: MouseEvent): void;
}

export class Mouseover extends InteractionBase<PointData, PointDataImpl, MouseoverFSM> {
    private readonly handler: MouseoverFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(withBubbling: boolean) {
        super(new MouseoverFSM(withBubbling), new PointDataImpl());

        this.handler = {
            "onEnter": (evt: MouseEvent): void => {
                this.data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
