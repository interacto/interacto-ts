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

import {FSMImpl} from "../../fsm/FSMImpl";
import {ScrollTransition} from "../../fsm/ScrollTransition";
import {InteractionBase} from "../InteractionBase";
import {ScrollDataImpl} from "../ScrollDataImpl";
import type {ScrollData} from "../../../api/interaction/ScrollData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

interface ScrollFSMHandler extends FSMDataHandler {
    initToScroll(event: Event): void;
}

/**
 * An FSM for scrolling.
 * @category FSM
 */
export class ScrollFSM extends FSMImpl {
    public constructor(logger: Logger, dataHandler: ScrollFSMHandler) {
        super(logger, dataHandler);

        new ScrollTransition(this.initState, this.addTerminalState("scrolled"),
            (evt: Event): void => {
                dataHandler.initToScroll(evt);
            });
    }
}

/**
 * A user interaction for scrolling using a mouse wheel. Consists of a single scroll.
 * @category Interaction Library
 */
export class Scroll extends InteractionBase<ScrollData, ScrollDataImpl> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const handler = {
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
