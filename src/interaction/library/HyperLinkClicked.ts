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

import { TerminalState } from "../../fsm/TerminalState";
import { isHyperLink } from "../../fsm/Events";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { WidgetData } from "../WidgetData";
import { HyperLinkTransition } from "../../fsm/HyperLinkTransition";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class HyperLinkClickedFSM extends FSM {
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

        new class extends HyperLinkTransition {
            public action(event: Event): void {
                if (event.target !== null && isHyperLink(event.target) && dataHandler !== undefined) {
                    dataHandler.initToClickedHandler(event);
                }
            }
        }(this.initState, clicked);
    }
}


interface HyperLinkClickedFSMHandler extends FSMDataHandler {
    initToClickedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 * @author Gwendal DIDOT
 */

export class HyperLinkClicked extends InteractionImpl<WidgetData<HTMLAnchorElement>, HyperLinkClickedFSM, HTMLAnchorElement> {
    private readonly handler: HyperLinkClickedFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new HyperLinkClickedFSM());

        this.handler = new class implements HyperLinkClickedFSMHandler {
            private readonly _parent: HyperLinkClicked;

            constructor(parent: HyperLinkClicked) {
                this._parent = parent;
            }

            public initToClickedHandler(event: Event): void {
                if (event.target !== null && isHyperLink(event.target)) {
                    this._parent._widget = event.target;
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

        }(this);

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

    public getData(): WidgetData<HTMLAnchorElement> {
        return this;
    }
}
