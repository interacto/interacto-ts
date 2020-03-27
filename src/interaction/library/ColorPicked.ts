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
import { isColorChoice } from "../../fsm/Events";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { WidgetData, WidgetDataImpl } from "./WidgetData";
import { ColorPickedTransition } from "../../fsm/ColorPickedTransition";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class ColorPickedFSM extends FSM {
    public constructor() {
        super();
    }

    public buildFSM(dataHandler?: ColorPickedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const picked: TerminalState = new TerminalState(this, "picked");
        this.addState(picked);

        new class extends ColorPickedTransition {
            public action(event: Event): void {
                if (event.target !== null && isColorChoice(event.target) && dataHandler !== undefined) {
                    dataHandler.initToPickedHandler(event);
                }
            }
        }(this.initState, picked);
    }
}


interface ColorPickedHandler extends FSMDataHandler {
    initToPickedHandler(event: Event): void;
}

/**
 * A user interaction for CheckBox
 * @author Gwendal DIDOT
 */

export class ColorPicked extends InteractionImpl<WidgetData<HTMLInputElement>, ColorPickedFSM> {
    private readonly handler: ColorPickedHandler;

    /**
     * Creates the interaction.
     */
    public constructor() {
        super(new ColorPickedFSM());

        this.handler = new class implements ColorPickedHandler {
            private readonly _parent: ColorPicked;

            public constructor(parent: ColorPicked) {
                this._parent = parent;
            }

            public initToPickedHandler(event: Event): void {
                if (event.target !== null && isColorChoice(event.target)) {
                    (this._parent.data as WidgetDataImpl<HTMLInputElement>).setWidget(event.target);
                }
            }

            public reinitData(): void {
                this._parent.reinitData();
            }

        }(this);

        this.fsm.buildFSM(this.handler);
    }

    public onNewNodeRegistered(node: EventTarget): void {
        if (isColorChoice(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isColorChoice(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public createDataObject(): WidgetData<HTMLInputElement> {
        return new WidgetDataImpl<HTMLInputElement>();
    }
}
