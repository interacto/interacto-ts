/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import {Bindings} from "../../api/binding/Bindings";
import {DwellSpringAnimation} from "../animation/DwellSpringAnimation";
import {KeysBinder} from "../binder/KeysBinder";
import {UpdateBinder} from "../binder/UpdateBinder";
import {Redo} from "../command/library/Redo";
import {Undo} from "../command/library/Undo";
import {BoxChecked} from "../interaction/library/BoxChecked";
import {ButtonPressed} from "../interaction/library/ButtonPressed";
import {Click} from "../interaction/library/Click";
import {Clicks} from "../interaction/library/Clicks";
import {ColorPicked} from "../interaction/library/ColorPicked";
import {ComboBoxSelected} from "../interaction/library/ComboBoxSelected";
import {DatePicked} from "../interaction/library/DatePicked";
import {DnD} from "../interaction/library/DnD";
import {DoubleClick} from "../interaction/library/DoubleClick";
import {DragLock} from "../interaction/library/DragLock";
import {HyperLinkClicked} from "../interaction/library/HyperLinkClicked";
import {KeyDown} from "../interaction/library/KeyDown";
import {KeysDown} from "../interaction/library/KeysDown";
import {KeysTyped} from "../interaction/library/KeysTyped";
import {KeyTyped} from "../interaction/library/KeyTyped";
import {KeyUp} from "../interaction/library/KeyUp";
import {LongMouseDown} from "../interaction/library/LongMouseDown";
import {LongTouch} from "../interaction/library/LongTouch";
import {MouseDown} from "../interaction/library/MouseDown";
import {MouseEnter} from "../interaction/library/MouseEnter";
import {MouseLeave} from "../interaction/library/MouseLeave";
import {MouseMove} from "../interaction/library/MouseMove";
import {MouseUp} from "../interaction/library/MouseUp";
import {MultiTouch} from "../interaction/library/MultiTouch";
import {bottomPan, hPan, leftPan, rightPan, topPan, vPan} from "../interaction/library/Pans";
import {Scroll} from "../interaction/library/Scroll";
import {SpinnerChanged} from "../interaction/library/SpinnerChanged";
import {Taps} from "../interaction/library/Taps";
import {TextInputChanged} from "../interaction/library/TextInputChanged";
import {TouchDnD} from "../interaction/library/TouchDnD";
import {TouchStart} from "../interaction/library/TouchStart";
import {twoBottomPan, twoHPan, twoLeftPan, twoRightPan, twoTopPan, twoVPan} from "../interaction/library/TwoPans";
import {rotate, scale} from "../interaction/library/TwoTouch";
import {Wheel} from "../interaction/library/Wheel";
import {ThreeTouchDnD, FourTouchDnD, twoTouch} from "../interaction/library/XTouch";
import {Or} from "../interaction/Or";
import {Then} from "../interaction/Then";
import {LoggerImpl} from "../logging/LoggerImpl";
import type {EltRef, Widget} from "../../api/binder/BaseBinderBuilder";
import type {BaseUpdateBinder} from "../../api/binder/BaseUpdateBinder";
import type {Binding} from "../../api/binding/Binding";
import type {
    PartialAnchorTypedBinder,
    PartialButtonTypedBinder,
    PartialInputTypedBinder,
    PartialKeyTypedBinder,
    PartialKeysTypedBinder,
    PartialMultiTouchTypedBinder,
    PartialPointTypedBinder,
    PartialPointsTypedBinder,
    PartialPointSrcTgtTypedBinder,
    PartialScrollTypedBinder,
    PartialSelectTypedBinder,
    PartialSpinnerTypedBinder,
    PartialTapsTypedBinder,
    PartialTextInputTypedBinder,
    PartialTouchTypedBinder,
    PartialTouchSrcTgtTypedBinder,
    PartialUpdatePointTypedBinder,
    PartialWheelTypedBinder,
    PartialPointOrTouchTypedBinder,
    PartialTwoTouchTypedBinder,
    PartialThreeTouchTypedBinder,
    PartialFourTouchTypedBinder,
    PartialRotateTypedBinder,
    PartialTwoPanTypedBinder,
    PartialScaleTypedBinder,
    PartialThenBinder,
    PartialPointsOrTapsTypedBinder,
    PartialTouchMouseDnDTypedBinder
} from "../../api/binding/Bindings";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {VisitorBinding} from "../../api/binding/VisitorBinding";
import type {LinterRule} from "../../api/checker/Checker";
import type {Interaction} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {GeneralTwoTouchData} from "../../api/interaction/TwoTouchData";
import type {WidgetData} from "../../api/interaction/WidgetData";
import type {Logger} from "../../api/logging/Logger";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";
import type {CommandBase} from "../command/CommandBase";
import type {GeneralTwoTouchDataImpl} from "../interaction/GeneralTwoTouchDataImpl";
import type {TwoPan} from "../interaction/library/TwoPans";
import type {Rotate, Scale} from "../interaction/library/TwoTouch";
import type {XTouchDnD} from "../interaction/library/XTouch";

/**
 * Implementation of Bindings. This class to be used in DI
 * for creating binders and bindings.
 * @category Binding
 */
export class BindingsImpl<H extends UndoHistoryBase> extends Bindings<H> {
    protected observer: BindingsObserver | undefined;

    protected readonly undoHistoryData: H;

    public readonly logger: Logger;

    public constructor(history: H, logger?: Logger) {
        super();
        this.undoHistoryData = history;
        this.logger = logger ?? new LoggerImpl();
    }

    public setLinterRules(...rules: ReadonlyArray<LinterRule>): void {
        this.observer?.checker.setLinterRules(...rules);
    }

    public get undoHistory(): H {
        return this.undoHistoryData;
    }

    public nodeBinder<A>(accInit?: A): BaseUpdateBinder {
        return new UpdateBinder<CommandBase, Interaction<InteractionData>, A>(this.undoHistory,
            this.logger, this.observer, undefined, accInit) as BaseUpdateBinder;
    }

    public buttonBinder<A>(accInit?: A): PartialButtonTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ButtonPressed, A>(() => new ButtonPressed(this.logger));
    }

    public checkboxBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<BoxChecked, A>(() => new BoxChecked(this.logger));
    }

    public colorPickerBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ColorPicked, A>(() => new ColorPicked(this.logger));
    }

    public comboBoxBinder<A>(accInit?: A): PartialSelectTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ComboBoxSelected, A>(() => new ComboBoxSelected(this.logger));
    }

    public spinnerBinder<A>(accInit?: A): PartialSpinnerTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<SpinnerChanged, A>(() => new SpinnerChanged(this.logger));
    }

    public dateBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DatePicked, A>(() => new DatePicked(this.logger));
    }

    public hyperlinkBinder<A>(accInit?: A): PartialAnchorTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<HyperLinkClicked, A>(() => new HyperLinkClicked(this.logger));
    }

    public textInputBinder<A>(timeout?: number, accInit?: A): PartialTextInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TextInputChanged, A>(() => new TextInputChanged(this.logger, timeout));
    }

    public touchDnDBinder<A>(cancellable: boolean, accInit?: A): PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(() => new TouchDnD(this.logger, cancellable));
    }

    public override touchStartBinder<A>(accInit?: A): PartialTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchStart, A>(() => new TouchStart(this.logger));
    }

    public reciprocalTouchDnDBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        const anim = new DwellSpringAnimation(handle, spring);

        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(() => new TouchDnD(this.logger, true))
            .on(handle)
            .then((_c, i) => {
                anim.process(i);
            })
            .endOrCancel(() => {
                anim.end();
            });
    }

    public reciprocalMouseOrTouchDnD<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>,
                                        accInit?: A): PartialTouchMouseDnDTypedBinder<A> {
        const anim = new DwellSpringAnimation(handle, spring);

        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Or<TouchDnD, DnD>, A>(() => new Or<TouchDnD, DnD>(
            new TouchDnD(this.logger, true), new DnD(true, this.logger), this.logger))
            .on(handle)
            .then((_c, i) => {
                anim.process(i);
            })
            .endOrCancel(() => {
                anim.end();
            });
    }

    public multiTouchBinder<A>(nbTouches: number, accInit?: A): PartialMultiTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MultiTouch, A>(() => new MultiTouch(nbTouches, false, this.logger));
    }

    public twoTouchBinder<A>(accInit?: A): PartialTwoTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<XTouchDnD<GeneralTwoTouchData, GeneralTwoTouchDataImpl>, A>(twoTouch(this.logger));
    }

    public threeTouchBinder<A>(accInit?: A): PartialThreeTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ThreeTouchDnD, A>(() => new ThreeTouchDnD(this.logger));
    }

    public fourTouchBinder<A>(accInit?: A): PartialFourTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<FourTouchDnD, A>(() => new FourTouchDnD(this.logger));
    }

    public tapsBinder<A>(tapsCount: number, accInit?: A): PartialTapsTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Taps, A>(() => new Taps(tapsCount, this.logger));
    }

    public longTouchBinder<A>(duration: number, accInit?: A): PartialTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<LongTouch, A>(() => new LongTouch(duration, this.logger));
    }

    public panBinder<A>(cancellable: boolean, accInit?: A): PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(() => new TouchDnD(this.logger, cancellable));
    }

    public panVerticalBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(vPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public panHorizontalBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(hPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public panLeftBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(leftPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public panRightBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(rightPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public panTopBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(topPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public panBottomBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, A>(bottomPan(this.logger, cancellable, pxTolerance, minLength, minVelocity));
    }

    public twoPanVerticalBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoVPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public twoPanHorizontalBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoHPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public twoPanLeftBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoLeftPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public twoPanRightBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoRightPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public twoPanTopBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoTopPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public twoPanBottomBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TwoPan, A>(twoBottomPan(this.logger, pxTolerance, minLength, minVelocity));
    }

    public rotateBinder<A>(pxTolerance: number, accInit?: A): PartialRotateTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Rotate, A>(rotate(this.logger, pxTolerance));
    }

    public scaleBinder<A>(pxTolerance: number, accInit?: A): PartialScaleTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Scale, A>(scale(this.logger, pxTolerance));
    }

    public clickBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Click, A>(() => new Click(this.logger));
    }

    public dbleClickBinder<A>(accInit?: A): PartialUpdatePointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DoubleClick, A>(() => new DoubleClick(this.logger));
    }

    public mouseUpBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseUp, A>(() => new MouseUp(this.logger));
    }

    public mouseDownBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseDown, A>(() => new MouseDown(this.logger));
    }

    public longMouseDownBinder<A>(duration: number, accInit?: A): PartialUpdatePointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<LongMouseDown, A>(() => new LongMouseDown(duration, this.logger));
    }

    public clicksBinder<A>(nbClicks: number, accInit?: A): PartialPointsTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Clicks, A>(() => new Clicks(nbClicks, this.logger));
    }

    public mouseLeaveBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseLeave, A>(() => new MouseLeave(withBubbling, this.logger));
    }

    public mouseEnterBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseEnter, A>(() => new MouseEnter(withBubbling, this.logger));
    }

    public mouseMoveBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseMove, A>(() => new MouseMove(this.logger));
    }

    public wheelBinder<A>(accInit?: A): PartialWheelTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Wheel, A>(() => new Wheel(this.logger));
    }

    public scrollBinder<A>(accInit?: A): PartialScrollTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Scroll, A>(() => new Scroll(this.logger));
    }

    public dndBinder<A>(cancellable: boolean, accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DnD, A>(() => new DnD(cancellable, this.logger));
    }

    public reciprocalDndBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        const anim = new DwellSpringAnimation(handle, spring);

        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DnD, A>(() => new DnD(true, this.logger))
            .on(handle)
            .then((_c, i) => {
                anim.process(i);
            })
            .endOrCancel(() => {
                anim.end();
            });
    }

    public dragLockBinder<A>(accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DragLock, A>(() => new DragLock(this.logger));
    }

    public keyUpBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyUp, A>(() => new KeyUp(this.logger, modifierAccepted));
    }

    public keyDownBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyDown, A>(() => new KeyDown(this.logger, modifierAccepted));
    }

    public keysDownBinder<A>(accInit?: A): PartialKeysTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeysDown, A>(() => new KeysDown(this.logger));
    }

    public keysTypeBinder<A>(accInit?: A): PartialKeysTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeysTyped, A>(() => new KeysTyped(this.logger));
    }

    public keyTypeBinder<A>(accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyTyped, A>(() => new KeyTyped(this.logger));
    }

    public mouseDownOrTouchStartBinder<A>(accInit?: A): PartialPointOrTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Or<MouseDown, TouchStart>, A>(() => new Or(new MouseDown(this.logger), new TouchStart(this.logger), this.logger));
    }

    public tapsOrClicksBinder<A>(nbTap: number, accInit?: A): PartialPointsOrTapsTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Or<Taps, Clicks>, A>(() => new Or(new Taps(nbTap, this.logger), new Clicks(nbTap, this.logger), this.logger));
    }

    public  longpressOrTouchBinder<A>(duration: number, accInit?: A): PartialPointOrTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Or<LongMouseDown, LongTouch>, A>(
            () => new Or(new LongMouseDown(duration, this.logger), new LongTouch(duration, this.logger), this.logger));
    }

    public combine<IX extends Array<Interaction<InteractionData>>, A>(interactions: IX, accInit?: A): PartialThenBinder<IX, A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Then<IX>, A>(() => new Then<IX>(interactions, this.logger));
    }

    public undoRedoBinder(undo: Widget<HTMLButtonElement>, redo: Widget<HTMLButtonElement>,
                          catchFn: ((err: unknown) => void) = ((): void => {})):
        [Binding<Undo, Interaction<WidgetData<HTMLButtonElement>>, unknown>,
            Binding<Redo, Interaction<WidgetData<HTMLButtonElement>>, unknown>] {
        return [
            this.buttonBinder()
                .on(undo)
                .toProduce(() => new Undo(this.undoHistory))
                .catch(catchFn)
                .bind(),
            this.buttonBinder()
                .on(redo)
                .toProduce(() => new Redo(this.undoHistory))
                .catch(catchFn)
                .bind()
        ];
    }

    public clear(): void {
        this.observer?.clearObservedBindings();
        this.undoHistory.clear();
    }

    public setBindingObserver(obs?: BindingsObserver): void {
        this.observer?.clearObservedBindings();
        this.observer = obs;
    }

    public override acceptVisitor(visitor: VisitorBinding): void {
        visitor.visitBindings(this);
    }
}
