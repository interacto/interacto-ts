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

import {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {TerminalState} from "../../fsm/TerminalState";
import {isScrollEvent} from "../../fsm/Events";
import {ScrollInteraction} from "./ScrollInteraction";
import {ScrollTransition} from "../../fsm/ScrollTransition";
import {ScrollData} from "./ScrollData";
import { FSM } from "../../fsm/FSM";

export class ScrollFSM extends FSM {

    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ScrollFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const scrolled: TerminalState = new TerminalState(this, "scrolled");
        this.addState(scrolled);

        new class extends ScrollTransition {
            public action(event: Event): void {
                if (event.target !== null && isScrollEvent(event) && dataHandler !== undefined) {
                    dataHandler.initToScroll(event);
                }
            }
        }(this.initState, scrolled);
    }
}


export interface ScrollFSMHandler extends FSMDataHandler {
    initToScroll(event: Event): void;
}

/**
 * A user interaction for pressing down the mouse button.
 * @author Gwendal DIDOT
 */
export class Scroll extends ScrollInteraction<ScrollData, ScrollFSM, undefined> {
    /**
     * Creates the interaction.
     */
    private readonly handler: ScrollFSMHandler;

    public constructor(fsm?: ScrollFSM) {
        super(fsm === undefined ? new ScrollFSM() : fsm);

        this.handler = new class implements ScrollFSMHandler {
            private readonly _parent: Scroll;

            constructor(parent: Scroll) {
                this._parent = parent;
            }

            public initToScroll(event: MouseEvent): void {
                this._parent.setScrollData(event);
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);
        this.getFsm().buildFSM(this.handler);
    }

    public getData(): ScrollData {
        return this;
    }
}
