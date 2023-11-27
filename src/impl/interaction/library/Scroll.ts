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
import {ScrollTransition} from "../../fsm/ScrollTransition";
import type {ScrollData} from "../../../api/interaction/ScrollData";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";
import {ScrollDataImpl} from "../ScrollDataImpl";
import type {Logger} from "../../../api/logging/Logger";

/**
 * An FSM for scrolling.
 */
export class ScrollFSM extends FSMImpl<ScrollFSMHandler> {
    public constructor(logger: Logger, dataHandler: ScrollFSMHandler) {
        super(logger, dataHandler);

        new ScrollTransition(this.initState, this.addTerminalState("scrolled"),
            (evt: Event): void => {
                this.dataHandler?.initToScroll(evt);
            });
    }
}

interface ScrollFSMHandler extends FSMDataHandler {
    initToScroll(event: Event): void;
}

/**
 * A user interaction for scrolling using a mouse wheel. Consists of a single scroll.
 */
export class Scroll extends InteractionBase<ScrollData, ScrollDataImpl, ScrollFSM> {
    /**
     * Creates the interaction.
     */
    public constructor(logger: Logger, name?: string) {
        const handler: ScrollFSMHandler = {
            "initToScroll": (event: Event): void => {
                this._data.setScrollData(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new ScrollFSM(logger, handler), new ScrollDataImpl(), logger, name ?? Scroll.name);
    }
}
