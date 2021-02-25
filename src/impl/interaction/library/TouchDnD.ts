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

import {InteractionBase} from "../InteractionBase";
import {FSMImpl} from "../../fsm/FSMImpl";
import type {FSMDataHandler} from "../../fsm/FSMDataHandler";
import {StdState} from "../../fsm/StdState";
import {TerminalState} from "../../fsm/TerminalState";
import {TouchPressureTransition} from "../../fsm/TouchPressureTransition";
import {TouchMoveTransition} from "../../fsm/TouchMoveTransition";
import {TouchReleaseTransition} from "../../fsm/TouchReleaseTransition";
import {getTouch} from "../../fsm/Events";
import {SrcTgtTouchDataImpl} from "../SrcTgtTouchDataImpl";
import type {SrcTgtPointsData} from "../../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../../api/interaction/TouchData";

/**
 * The FSM that defines a touch interaction (that works like a DnD)
 */
export class TouchDnDFSM extends FSMImpl {
    private touchID?: number;

    /**
     * Creates the FSM.
     */
    public constructor() {
        super();
        this.touchID = undefined;
    }

    public buildFSM(dataHandler?: TouchDnDFSMHandler): void {
        if (this.states.length > 1) {
            return;
        }

        super.buildFSM(dataHandler);

        const touched = new StdState(this, "touched");
        const released = new TerminalState(this, "released");

        this.addState(touched);
        this.addState(released);

        const pressure = new TouchPressureTransition(this.initState, touched);
        pressure.action = (event: TouchEvent): void => {
            this.touchID = event.changedTouches[0].identifier;
            dataHandler?.onTouch(event);
        };

        const move = new TouchMoveTransition(touched, touched);
        move.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
        move.action = (event: TouchEvent): void => {
            dataHandler?.onMove(event);
        };

        const release = new TouchReleaseTransition(touched, released);
        release.isGuardOK = (event: TouchEvent): boolean => event.changedTouches[0].identifier === this.touchID;
        release.action = (event: TouchEvent): void => {
            dataHandler?.onRelease(event);
        };

        super.buildFSM(dataHandler);
    }

    public getTouchId(): number | undefined {
        return this.touchID;
    }

    public reinit(): void {
        super.reinit();
        this.touchID = undefined;
    }
}

export interface TouchDnDFSMHandler extends FSMDataHandler {
    onTouch(event: TouchEvent): void;

    onMove(event: TouchEvent): void;

    onRelease(event: TouchEvent): void;
}

/**
 * A touch interaction (that works as a DnD)
 */
export class TouchDnD extends InteractionBase<SrcTgtPointsData<TouchData>, SrcTgtTouchDataImpl, TouchDnDFSM> {
    private readonly handler: TouchDnDFSMHandler;

    /**
     * Creates the interaction.
     */
    public constructor(fsm?: TouchDnDFSM) {
        super(fsm ?? new TouchDnDFSM(), new SrcTgtTouchDataImpl());

        this.handler = {
            "onTouch": (evt: TouchEvent): void => {
                const touch: Touch = evt.changedTouches[0];
                this.data.copySrc(touch, evt);
                this.data.copyTgt(touch, evt);
            },
            "onMove": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "onRelease": (evt: TouchEvent): void => {
                this.setTgtData(evt);
            },
            "reinitData": (): void => {
                this.reinitData();
            }
        };

        this.getFsm().buildFSM(this.handler);
    }

    private setTgtData(evt: TouchEvent): void {
        const touch: Touch | undefined = getTouch(evt.changedTouches, this.data.src.identifier);
        if (touch !== undefined) {
            this.data.copyTgt(touch, evt);
        }
    }
}
