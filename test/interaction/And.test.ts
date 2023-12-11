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

import {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {InteractionBase} from "../../src/impl/interaction/InteractionBase";
import {StdState, SubFSMTransition, TerminalState, rightPan} from "../../src/interacto";
import {robot} from "interacto-nono";
import {mock} from "jest-mock-extended";
import type {FSM} from "../../src/api/fsm/FSM";
import type {InteractionData} from "../../src/api/interaction/InteractionData";
import type {Logger} from "../../src/api/logging/Logger";
import type {FSMDataHandler} from "../../src/impl/fsm/FSMDataHandler";
import type {Flushable} from "../../src/impl/interaction/Flushable";
import type {FSMHandler, OutputState, SrcTgtPointsData, SrcTgtTouchDataImpl, TouchData, TouchDnD} from "../../src/interacto";
import type {MockProxy} from "jest-mock-extended";

class ThenFSM<T extends FSMDataHandler> extends FSMImpl<T> {
    public constructor(fsms: Array<FSM>, logger: Logger) {
        super(logger);

        let currentState: OutputState = this.initState;
        const last = fsms.length - 1;

        for (const [i, fsm] of fsms.entries()) {
            if (i === last) {
                new SubFSMTransition(currentState, new TerminalState(this, i.toString()), fsm);
            } else {
                const state = new StdState(this, i.toString());
                new SubFSMTransition(currentState, state, fsm);
                currentState = state;
            }
        }
    }
}

interface ThenData<DX extends Array<unknown>> {
    readonly dx: DX;
}

class ThenDataImpl<DX extends Array<Flushable>> implements ThenData<DX>, Flushable {
    public readonly dx: DX;

    public constructor(dx: DX) {
        this.dx = dx;
    }

    public flush(): void {
        for (const d of this.dx) {
            d.flush();
        }
    }
}

// interface ThenInteraction<IX extends Array<InteractionBase<InteractionData, Flushable & InteractionData, FSM>>,
//     DX extends Array<unknown>,
//     DXImpl extends Array<Flushable>> {
// }

class ThenX<IX extends Array<InteractionBase<InteractionData, Flushable & InteractionData, FSM>>,
    DX extends Array<unknown>,
    DXImpl extends Array<Flushable> & DX>
    extends InteractionBase<ThenData<DX>, ThenDataImpl<DXImpl>, FSM> {
    // implements ThenInteraction<IX, DX, DXImpl> {

    private readonly ix: IX;

    public constructor(ix: IX, logger: Logger) {
        super(new ThenFSM(ix.map(inter => inter.fsm), logger),
            new ThenDataImpl(ix.map(inter => inter.data) as unknown as DXImpl), logger, "");
        this.ix = ix;
    }

    public override uninstall(): void {
        super.uninstall();
        for (const inter of this.ix) {
            inter.uninstall();
        }
    }

    public override reinit(): void {
        super.reinit();
        for (const inter of this.ix) {
            inter.reinit();
        }
    }

    public override fullReinit(): void {
        super.fullReinit();
        for (const inter of this.ix) {
            inter.fullReinit();
        }
    }

    public override reinitData(): void {
        super.reinitData();
        for (const inter of this.ix) {
            inter.reinitData();
        }
    }
}

// class Then<
//     I1 extends InteractionBase<D1, D1Impl, FSM>,
//     I2 extends InteractionBase<D2, D2Impl, FSM>,
//     D1 extends InteractionData = InteractionDataType<I1>,
//     D2 extends InteractionData = InteractionDataType<I2>,
//     D1Impl extends D1 & Flushable = InteractionDataImplType<I1>,
//     D2Impl extends D2 & Flushable = InteractionDataImplType<I2>>
//     extends InteractionBase<ThenData<[D1, D2]>, ThenDataImpl<[D1Impl, D2Impl]>, FSM> {

//     private readonly i1: I1;

//     private readonly i2: I2;

//     public constructor(i1: I1, i2: I2, logger: Logger) {
//         super(new ThenFSM([i1.fsm, i2.fsm], logger),
//             new ThenDataImpl([i1.data as unknown as D1Impl, i2.data as unknown as D2Impl]), logger, `${i1.name}-${i2.name}`);
//         this.i1 = i1;
//         this.i2 = i2;
//     }
// }

describe("that then interaction works", () => {
    const theLogger: Logger & MockProxy<Logger> = mock<Logger>();
    let canvas: HTMLElement;
    // let doubleSwipe: Then<TouchDnD, TouchDnD>;
    // let data: ThenData<[SrcTgtPointsData<TouchData>, SrcTgtPointsData<TouchData>]>;
    let doubleSwipeX: ThenX<[TouchDnD, TouchDnD],
    [SrcTgtPointsData<TouchData>, SrcTgtPointsData<TouchData>],
    [SrcTgtTouchDataImpl, SrcTgtTouchDataImpl]>;
    let handler: FSMHandler;
    // let i: ThenInteraction<[TouchDnD, TouchStart, KeyTyped], [SrcTgtPointsData<TouchData>, TouchData, KeyData],
    //     [SrcTgtTouchDataImpl, TouchDataImpl, KeyDataImpl]>;
    // let foo: ThenData<[TouchDataImpl, KeyDataImpl, KeysDataImpl]> = new ThenDataImpl([new TouchDataImpl(), new KeyDataImpl(), new KeysDataImpl()]);

    beforeEach(() => {
        handler = mock<FSMHandler>();
        canvas = document.createElement("canvas");
        jest.useFakeTimers();
        // doubleSwipe = new Then<TouchDnD, TouchDnD>(rightPan(theLogger, false, 10, 100, 100)(),
        // rightPan(theLogger, false, 10, 100, 100)(), theLogger);
        doubleSwipeX = new ThenX<[TouchDnD, TouchDnD],
        [SrcTgtPointsData<TouchData>, SrcTgtPointsData<TouchData>],
        [SrcTgtTouchDataImpl, SrcTgtTouchDataImpl]>(
            [rightPan(theLogger, false, 10, 100)(), rightPan(theLogger, false, 10, 100)()], theLogger);
        // data = doubleSwipe.data;
        // console.log(data);

        doubleSwipeX.fsm.addHandler(handler);
        doubleSwipeX.registerToNodes([canvas]);
        // i = new ThenX<[TouchDnD, TouchStart, KeyTyped], [SrcTgtPointsData<TouchData>, TouchData, KeyData],
        //         [SrcTgtTouchDataImpl, TouchDataImpl, KeyDataImpl]>([
        //             rightPan(theLogger, false, 10, 100, 100)(),
        //             new TouchStart(theLogger),
        //             new KeyTyped(theLogger)
        //         ], theLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        doubleSwipeX.uninstall();
    });

    test("when double swipe right", () => {
        robot(canvas)
            .pan(1, 200, "right", {clientX: 0, clientY: 0})
            .pan(2, 200, "right", {clientX: 0, clientY: 0});

        expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
        expect(handler.fsmStops).toHaveBeenCalledTimes(1);
    });
});

