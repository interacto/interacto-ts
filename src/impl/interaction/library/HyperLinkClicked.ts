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

import {isHyperLink} from "../../fsm/Events";
import {FSMImpl} from "../../fsm/FSMImpl";
import {HyperLinkTransition} from "../../fsm/HyperLinkTransition";
import {InteractionBase} from "../InteractionBase";
import {WidgetDataImpl} from "../WidgetDataImpl";
import type {WidgetData} from "../../../api/interaction/WidgetData";
import type {Logger} from "../../../api/logging/Logger";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";

class HyperLinkClickedFSM extends FSMImpl<HyperLinkClickedFSMHandler> {
    public constructor(logger: Logger, dataHandler: HyperLinkClickedFSMHandler) {
        super(logger, dataHandler);

        new HyperLinkTransition(this.initState, this.addTerminalState("clicked"),
            (evt: Event): void => {
                this.dataHandler?.initToClickedHandler(evt);
            });
    }
}

interface HyperLinkClickedFSMHandler extends FSMDataHandler {
    initToClickedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 * @category Interaction Library
 */
export class HyperLinkClicked extends InteractionBase<WidgetData<HTMLAnchorElement>, WidgetDataImpl<HTMLAnchorElement>, HyperLinkClickedFSM> {
    /**
     * Creates the interaction.
     * @param logger - The logger to use for this interaction
     * @param name - The name of the user interaction
     */
    public constructor(logger: Logger, name?: string) {
        const handler: HyperLinkClickedFSMHandler = {
            "initToClickedHandler": (event: Event): void => {
                this._data.copy(event);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        super(new HyperLinkClickedFSM(logger, handler), new WidgetDataImpl<HTMLAnchorElement>(), logger, name ?? HyperLinkClicked.name);
    }

    public override onNewNodeRegistered(node: EventTarget): void {
        if (isHyperLink(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public override onNodeUnregistered(node: EventTarget): void {
        if (isHyperLink(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }
}
