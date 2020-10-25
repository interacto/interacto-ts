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

import {TerminalState} from "../../fsm/TerminalState";
import {isHyperLink} from "../../fsm/Events";
import {FSMDataHandler} from "../../../api/fsm/FSMDataHandler";
import {WidgetData, WidgetDataImpl} from "../../../api/interaction/WidgetData";
import {HyperLinkTransition} from "../../fsm/HyperLinkTransition";
import {FSMImpl} from "../../fsm/FSMImpl";
import {InteractionBase} from "../InteractionBase";

export class HyperLinkClickedFSM extends FSMImpl {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: HyperLinkClickedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const clicked: TerminalState = new TerminalState(this, "clicked");
        this.addState(clicked);

        const tr = new HyperLinkTransition(this.initState, clicked);
        tr.action = (event: Event): void => {
            if (event.target !== null && isHyperLink(event.target) && dataHandler !== undefined) {
                dataHandler.initToClickedHandler(event);
            }
        };
    }
}


interface HyperLinkClickedFSMHandler extends FSMDataHandler {
    initToClickedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 * @author Gwendal DIDOT
 */
export class HyperLinkClicked extends InteractionBase<WidgetData<HTMLAnchorElement>, HyperLinkClickedFSM> {
    private readonly handler: HyperLinkClickedFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new HyperLinkClickedFSM());

        this.handler = {
            "initToClickedHandler": (event: Event): void => {
                if (event.target !== null && isHyperLink(event.target)) {
                    (this.data as WidgetDataImpl<HTMLAnchorElement>).setWidget(event.target);
                }
            },
            "reinitData": (): void => this.reinitData()
        };

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isHyperLink(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isHyperLink(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public createDataObject(): WidgetData<HTMLAnchorElement> {
        return new WidgetDataImpl<HTMLAnchorElement>();
    }
}