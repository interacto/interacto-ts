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
import { isTextInput } from "../../fsm/Events";
import { FSMDataHandler } from "../../fsm/FSMDataHandler";
import { WidgetData } from "../WidgetData";
import { StdState } from "../../fsm/StdState";
import { TextInputChangedTransition } from "../../fsm/TextInputChangedTransition";
import { TimeoutTransition } from "../../fsm/TimeoutTransition";
import { OutputState } from "../../fsm/OutputState";
import { InputState } from "../../fsm/InputState";
import { FSM } from "../../fsm/FSM";
import { InteractionImpl } from "../InteractionImpl";

export class TextInputChangedFSM extends FSM {
    /** The time gap between the two spinner events. */
    private readonly _timeGap: number = 1000;
    /** The supplier that provides the time gap. */
    private readonly SUPPLY_TIME_GAP: () => number = () => this.getTimeGap();

    /**
     * @return The time gap between the two spinner events.
     */
    public getTimeGap(): number {
        return this._timeGap;
    }

    public constructor(timeSet?: number) {
        super();
        if (timeSet !== undefined) {
            this._timeGap = timeSet;
        }
    }

    public buildFSM(dataHandler?: TextInputChangedHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);
        const changed: StdState = new StdState(this, "changed");
        const ended: TerminalState = new TerminalState(this, "ended");
        this.addState(changed);
        this.addState(ended);

        new class extends TextInputChangedTransition {

            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }

            public action(event: Event): void {
                if (event.target !== null && isTextInput(event.target) && dataHandler !== undefined) {
                    dataHandler.initToChangedHandler(event);
                }
            }
        }(this.initState, changed);

        new class extends TextInputChangedTransition {

            public constructor(srcState: OutputState, tgtState: InputState) {
                super(srcState, tgtState);
            }

            public action(event: Event): void {
                if (event.target !== null && isTextInput(event.target) && dataHandler !== undefined) {
                    dataHandler.initToChangedHandler(event);
                }
            }
        }(changed, changed);

        new TimeoutTransition(changed, ended, this.SUPPLY_TIME_GAP);
    }
}


interface TextInputChangedHandler extends FSMDataHandler {
    initToChangedHandler(event: Event): void;
}

/**
 * A user interaction for Number input.
 * @author Gwendal DIDOT
 */
export class TextInputChanged extends
    InteractionImpl<WidgetData<HTMLInputElement | HTMLTextAreaElement>, TextInputChangedFSM, HTMLInputElement | HTMLTextAreaElement> {
    private readonly handler: TextInputChangedHandler;

    public constructor(timeGap?: number) {
        super(new TextInputChangedFSM(timeGap));

        this.handler = new class implements TextInputChangedHandler {
            private readonly _parent: TextInputChanged;

            public constructor(parent: TextInputChanged) {
                this._parent = parent;
            }

            public initToChangedHandler(event: Event): void {
                if (event.target !== null && isTextInput(event.target)) {
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
        if (isTextInput(node)) {
            this.registerActionHandlerInput(node);
        }
    }

    public onNodeUnregistered(node: EventTarget): void {
        if (isTextInput(node)) {
            this.unregisterActionHandlerInput(node);
        }
    }

    public getData(): WidgetData<HTMLInputElement | HTMLTextAreaElement> {
        return this;
    }
}
