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
import {ClickTransition} from "../../fsm/ClickTransition";
import type {PointData} from "../../../api/interaction/PointData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {PointDataImpl} from "../PointDataImpl";

/**
 * The FSM for click interactions
 */
export class ClickFSM extends FSMImpl {
    private checkButton?: number;

    /**
     * Creates the FSM
     */
    public constructor() {
        super();
    }

    public override buildFSM(dataHandler?: ClickFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const clicked = new TerminalState(this, "clicked");
        this.addState(clicked);

        const clickt = new ClickTransition(this.initState, clicked);
        clickt.action = (event: MouseEvent): void => {
            this.setCheckButton(event.button);
            dataHandler?.initToClicked(event);
        };
        clickt.isGuardOK = (event: MouseEvent): boolean => this.checkButton === undefined || event.button === this.checkButton;
    }

    public getCheckButton(): number {
        return this.checkButton ?? -1;
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
    }

    public override reinit(): void {
        super.reinit();
        this.checkButton = undefined;
    }
}

interface ClickFSMHandler extends FSMDataHandler {
    initToClicked(event: MouseEvent): void;
}

export class Click extends InteractionBase<PointData, PointDataImpl, ClickFSM> {
    private readonly handler: ClickFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(fsm?: ClickFSM, data?: PointDataImpl) {
        super(fsm ?? new ClickFSM(), data ?? new PointDataImpl());

        this.handler = {
            "initToClicked": (evt: MouseEvent): void => {
                this.data.copy(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }
}
