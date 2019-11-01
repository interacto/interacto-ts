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

// IMPORTANT : this interaction is not fully supported by Web browsers yet.
// see https://developer.mozilla.org/fr/docs/Web/HTML/Element/menu for more information.

import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { TerminalState } from "../../fsm/TerminalState";
import { isMenuButton } from "../../fsm/Events";
import { WidgetData } from "../WidgetData";
import { MenuButtonPressedTransition } from "../../fsm/MenuButtonPressedTransition";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";


export class MenuButtonPressedFSM extends FSM {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: MenuButtonPressedFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }
        super.buildFSM(dataHandler);
        const pressed: TerminalState = new TerminalState(this, "pressed");
        this.addState(pressed);

        new class extends MenuButtonPressedTransition {
            public action(event: Event): void {
                if (event.target !== null && isMenuButton(event.target) && dataHandler !== undefined) {
                    dataHandler.initToPressedHandler(event);
                }
            }
        }(this.initState, pressed);
    }
}

export interface MenuButtonPressedFSMHandler extends FSMDataHandler {
    initToPressedHandler(event: Event): void;
}

/**
 * A user interaction for menu buttons.
 * @author Gwendal Didot
 */
export class MenuButtonPressed extends InteractionImpl<WidgetData<Element>, MenuButtonPressedFSM, Element> {
    private readonly handler: MenuButtonPressedFSMHandler;

    /**
     * Create the interaction.
     */
    public constructor() {
        super(new MenuButtonPressedFSM());

        this.handler = new class implements MenuButtonPressedFSMHandler {
            private readonly _parent: MenuButtonPressed;

            constructor(parent: MenuButtonPressed) {
                this._parent = parent;
            }

            public initToPressedHandler(event: Event): void {
                if (event.target !== null && isMenuButton(event.target)) {
                    this._parent._widget = event.currentTarget as Element;
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }
        }(this);

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isMenuButton(node)) {
            this.registerActionHandlerClick(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isMenuButton(node)) {
            this.unregisterActionHandlerClick(node);
        }
    }

    public getData(): WidgetData<Element> {
        return this;
    }
}
