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

import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { TerminalState } from "../../fsm/TerminalState";
import { ClickTransition } from "../../fsm/ClickTransition";
import { InputState } from "../../fsm/InputState";
import { OutputState } from "../../fsm/OutputState";
import { PointInteraction } from "./PointInteraction";
import { PointData } from "./PointData";
import { FSM } from "../../fsm/FSM";

export class ClickFSM extends FSM {
    private checkButton?: number;

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ClickFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const clicked = new TerminalState(this, "clicked");
        this.addState(clicked);

        new class extends ClickTransition {
            private readonly _parent: ClickFSM;

            public constructor(parent: ClickFSM, srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
                this._parent = parent;
            }

            public action(event: Event): void {
                if (event instanceof MouseEvent) {
                    this._parent.setCheckButton(event.button);

                    if (dataHandler !== undefined) {
                        dataHandler.initToClicked(event);
                    }
                }
            }

            public isGuardOK(event: Event): boolean {
                return super.isGuardOK(event) && this._parent.checkButton === undefined ||
                    (event instanceof MouseEvent && event.button === this._parent.checkButton);
            }
        }(this, this.initState, clicked);
    }

    public getCheckButton(): number {
        return this.checkButton ?? -1;
    }

    public setCheckButton(buttonToCheck: number): void {
        if (this.checkButton === undefined) {
            this.checkButton = buttonToCheck;
        }
    }

    public reinit(): void {
        super.reinit();
        this.checkButton = undefined;
    }
}

interface ClickFSMHandler extends FSMDataHandler {
    initToClicked(event: MouseEvent): void;
}

export class Click extends PointInteraction<PointData, ClickFSM, Node> {
    private readonly handler: ClickFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(fsm?: ClickFSM) {
        super(fsm ?? new ClickFSM());

        this.handler = new class implements ClickFSMHandler {
            private readonly _parent: Click;

            public constructor(parent: Click) {
                this._parent = parent;
            }

            public initToClicked(event: MouseEvent): void {
                this._parent.setPointData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);

        this.getFsm().buildFSM(this.handler);
    }

    public getData(): PointData {
        return this;
    }
}
