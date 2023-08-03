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

import {ButtonPressed} from "../interaction/library/ButtonPressed";
import type {WidgetData} from "../../api/interaction/WidgetData";
import {UpdateBinder} from "../binder/UpdateBinder";
import {BoxChecked} from "../interaction/library/BoxChecked";
import {ColorPicked} from "../interaction/library/ColorPicked";
import {ComboBoxSelected} from "../interaction/library/ComboBoxSelected";
import {SpinnerChanged} from "../interaction/library/SpinnerChanged";
import {DatePicked} from "../interaction/library/DatePicked";
import type {Interaction} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {CommandBase} from "../command/CommandBase";
import type {BaseUpdateBinder} from "../../api/binder/BaseUpdateBinder";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import {TextInputChanged} from "../interaction/library/TextInputChanged";
import {MultiTouch} from "../interaction/library/MultiTouch";
import type {MultiTouchData} from "../../api/interaction/MultiTouchData";
import {Tap} from "../interaction/library/Tap";
import {LongTouch} from "../interaction/library/LongTouch";
import type {TouchData} from "../../api/interaction/TouchData";
import {Click} from "../interaction/library/Click";
import type {PointData} from "../../api/interaction/PointData";
import type {PointsData} from "../../api/interaction/PointsData";
import type {MousePointsData} from "../../api/interaction/MousePointsData";
import {MouseDown} from "../interaction/library/MouseDown";
import {DnD} from "../interaction/library/DnD";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import {DoubleClick} from "../interaction/library/DoubleClick";
import {DragLock} from "../interaction/library/DragLock";
import {HyperLinkClicked} from "../interaction/library/HyperLinkClicked";
import {KeyDown} from "../interaction/library/KeyDown";
import type {KeyData} from "../../api/interaction/KeyData";
import type {KeysData} from "../../api/interaction/KeysData";
import {KeysDown} from "../interaction/library/KeysDown";
import {KeysTyped} from "../interaction/library/KeysTyped";
import {KeyTyped} from "../interaction/library/KeyTyped";
import {Scroll} from "../interaction/library/Scroll";
import type {ScrollData} from "../../api/interaction/ScrollData";
import {KeysBinder} from "../binder/KeysBinder";
import {TouchDnD} from "../interaction/library/TouchDnD";
import {LongMouseDown} from "../interaction/library/LongMouseDown";
import {Clicks} from "../interaction/library/Clicks";
import {MouseLeave} from "../interaction/library/MouseLeave";
import {MouseEnter} from "../interaction/library/MouseEnter";
import {MouseMove} from "../interaction/library/MouseMove";
import type {EltRef, Widget} from "../../api/binder/BaseBinderBuilder";
import {Undo} from "../command/library/Undo";
import type {Binding} from "../../api/binding/Binding";
import {Redo} from "../command/library/Redo";
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
    PartialWheelTypedBinder
} from "../../api/binding/Bindings";
import {Bindings} from "../../api/binding/Bindings";
import type {Logger} from "../../api/logging/Logger";
import {LoggerImpl} from "../logging/LoggerImpl";
import type {WheelData} from "../../api/interaction/WheelData";
import {Wheel} from "../interaction/library/Wheel";
import {KeyUp} from "../interaction/library/KeyUp";
import {MouseUp} from "../interaction/library/MouseUp";
import {DwellSpringAnimation} from "../animation/DwellSpringAnimation";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";

export class BindingsImpl<H extends UndoHistoryBase> extends Bindings<H> {
    protected observer: BindingsObserver | undefined;

    protected readonly undoHistoryData: H;

    public readonly logger: Logger;

    public constructor(history: H, logger?: Logger) {
        super();
        this.undoHistoryData = history;
        this.logger = logger ?? new LoggerImpl();
    }

    public get undoHistory(): H {
        return this.undoHistoryData;
    }

    public nodeBinder<A>(accInit?: A): BaseUpdateBinder {
        return new UpdateBinder<CommandBase, Interaction<InteractionData>, InteractionData, A>(this.undoHistory,
            this.logger, this.observer, undefined, accInit) as BaseUpdateBinder;
    }

    public buttonBinder<A>(accInit?: A): PartialButtonTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ButtonPressed, WidgetData<HTMLButtonElement>, A>(() => new ButtonPressed(this.logger));
    }

    public checkboxBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<BoxChecked, WidgetData<HTMLInputElement>, A>(() => new BoxChecked(this.logger));
    }

    public colorPickerBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ColorPicked, WidgetData<HTMLInputElement>, A>(() => new ColorPicked(this.logger));
    }

    public comboBoxBinder<A>(accInit?: A): PartialSelectTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<ComboBoxSelected, WidgetData<HTMLSelectElement>, A>(() => new ComboBoxSelected(this.logger));
    }

    public spinnerBinder<A>(accInit?: A): PartialSpinnerTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<SpinnerChanged, WidgetData<HTMLInputElement>, A>(() => new SpinnerChanged(this.logger));
    }

    public dateBinder<A>(accInit?: A): PartialInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DatePicked, WidgetData<HTMLInputElement>, A>(() => new DatePicked(this.logger));
    }

    public hyperlinkBinder<A>(accInit?: A): PartialAnchorTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<HyperLinkClicked, WidgetData<HTMLAnchorElement>, A>(() => new HyperLinkClicked(this.logger));
    }

    public textInputBinder<A>(timeout?: number, accInit?: A): PartialTextInputTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>, A>(
            () => new TextInputChanged(this.logger, timeout));
    }

    public touchDnDBinder<A>(cancellable: boolean, accInit?: A): PartialTouchSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, SrcTgtPointsData<TouchData>, A>(() => new TouchDnD(this.logger, cancellable));
    }

    /**
     * Creates a binding that uses the Reciprocal DnD interaction with a touch.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public reciprocalTouchDnDBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A
    ): PartialTouchSrcTgtTypedBinder<A> {
        const anim = new DwellSpringAnimation(handle, spring);

        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<TouchDnD, SrcTgtPointsData<TouchData>, A>(() => new TouchDnD(this.logger, true))
            .on(handle)
            .then((_, i) => {
                anim.process(i);
            })
            .endOrCancel(() => {
                anim.end();
            });
    }

    /**
     * Creates a binding that uses the multi-touch user interaction.
     * @param nbTouches - The number of required touches.
     * A multi-touch starts when all its touches have started.
     * A multi-touch ends when the number of required touches is greater than the number of touches.
     */
    public multiTouchBinder<A>(nbTouches: number, accInit?: A): PartialMultiTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MultiTouch, MultiTouchData, A>(() => new MultiTouch(nbTouches, false, this.logger));
    }

    /**
     * Creates a binding that uses the tap user interaction.
     * @param nbTap - The number of required taps.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public tapBinder<A>(nbTap: number, accInit?: A): PartialTapsTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Tap, PointsData<TouchData>, A>(() => new Tap(nbTap, this.logger));
    }

    /**
     * Creates a binding that uses the long touch interaction.
     * @param duration - The duration of the touch to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public longTouchBinder<A>(duration: number, accInit?: A): PartialTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<LongTouch, TouchData, A>(() => new LongTouch(duration, this.logger));
    }

    /**
     * Creates a binding that uses the swipe interaction.
     * If this velocity is not reached, the interaction is cancelled.
     * @param horizontal - Defines whether the swipe is horizontal or vertical
     * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param minLength - The minimal distance from the starting point to the release point for validating the swipe
     * @param nbTouches - The number of touches required to start the interaction
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the swipe
     */
    public swipeBinder<A>(horizontal: boolean, minVelocity: number, minLength: number, nbTouches: number,
                          pxTolerance: number, accInit?: A): PartialMultiTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MultiTouch, MultiTouchData, A>(() => new MultiTouch(nbTouches, true, this.logger))
            .when(i => (horizontal ? i.isHorizontal(pxTolerance) : i.isVertical(pxTolerance)))
            .when(i => i.touches[0] !== undefined &&
                (horizontal ? Math.abs(i.touches[0].diffScreenX) >= minLength : Math.abs(i.touches[0].diffScreenY) >= minLength))
            // The velocity value is in pixels/ms, so conversion is necessary
            .when(i => i.touches[0] !== undefined && i.touches[0].velocity * 1000 >= minVelocity);
    }

    /**
     * Creates a binding that uses the pan interaction.
     * @param horizontal - Defines whether the pan is horizontal or vertical
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param nbTouches - The number of touches required to start the interaction
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public panBinder<A>(horizontal: boolean, minLength: number, nbTouches: number, pxTolerance: number, accInit?: A):
    PartialMultiTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MultiTouch, MultiTouchData, A>(() => new MultiTouch(nbTouches, true, this.logger))
            .when(i => (horizontal ? i.isHorizontal(pxTolerance) : i.isVertical(pxTolerance)))
            .when(i => i.touches[0] !== undefined &&
                (horizontal ? Math.abs(i.touches[0].diffScreenX) >= minLength : Math.abs(i.touches[0].diffScreenY) >= minLength));
    }

    /**
     * Creates a binding that uses the pinch interaction.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pinch
     */
    public pinchBinder<A>(pxTolerance: number, accInit?: A): PartialMultiTouchTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MultiTouch, MultiTouchData, A>(() => new MultiTouch(2, false, this.logger))
            .when(i => i.pinchFactor(pxTolerance) !== undefined);
    }

    /**
     * Creates a binding that uses the click interaction.
     */
    public clickBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Click, PointData, A>(() => new Click(this.logger));
    }

    /**
     * Creates a binding that uses the double click interaction.
     */
    public dbleClickBinder<A>(accInit?: A): PartialUpdatePointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DoubleClick, PointData, A>(() => new DoubleClick(this.logger));
    }

    /**
     * Creates a binding that uses the MouseUp (mouse button released) interaction.
     */
    public mouseUpBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseUp, PointData, A>(() => new MouseUp(this.logger));
    }

    /**
     * Creates a binding that uses the MouseDown (mouse button pressed) interaction.
     */
    public mouseDownBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseDown, PointData, A>(() => new MouseDown(this.logger));
    }

    /**
     * Creates a binding that uses the LongMouseDown
     * (mouse button pressed for a certain amount of time) interaction.
     * @param duration - The duration of the pressure to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public longMouseDownBinder<A>(duration: number, accInit?: A): PartialUpdatePointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<LongMouseDown, PointData, A>(() => new LongMouseDown(duration, this.logger));
    }

    /**
     * Creates a binding for clicking n times.
     * @param nbClicks - The number of clicks to do.
     * If this number is not reached, the interaction is cancelled after a timeout of 1s.
     */
    public clicksBinder<A>(nbClicks: number, accInit?: A): PartialPointsTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Clicks, MousePointsData, A>(() => new Clicks(nbClicks, this.logger));
    }

    /**
     * Creates a binding that uses the MouseLeave (mouse cursor leaves the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public mouseLeaveBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseLeave, PointData, A>(() => new MouseLeave(withBubbling, this.logger));
    }

    /**
     * Creates a binding that uses the MouseEnter (mouse cursor enters the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public mouseEnterBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseEnter, PointData, A>(() => new MouseEnter(withBubbling, this.logger));
    }

    /**
     * Creates a binding that uses the MouseMove (mouse cursor moves) interaction.
     */
    public mouseMoveBinder<A>(accInit?: A): PartialPointTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<MouseMove, PointData, A>(() => new MouseMove(this.logger));
    }

    /**
     * Creates a binding that uses the Wheel (user uses a mouse scrolling wheel) interaction.
     */
    public wheelBinder<A>(accInit?: A): PartialWheelTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Wheel, WheelData, A>(() => new Wheel(this.logger));
    }

    /**
     * Creates a binding that uses the mouse scroll interaction.
     */
    public scrollBinder<A>(accInit?: A): PartialScrollTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<Scroll, ScrollData, A>(() => new Scroll(this.logger));
    }

    /**
     * Creates a binding that uses the DnD interaction.
     * @param cancellable - True: the escape key will cancel the DnD.
     */
    public dndBinder<A>(cancellable: boolean, accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DnD, SrcTgtPointsData<PointData>, A>(() => new DnD(cancellable, this.logger));
    }

    /**
     * Creates a binding that uses the Reciprocal DnD interaction.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public reciprocalDndBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        const anim = new DwellSpringAnimation(handle, spring);

        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DnD, SrcTgtPointsData<PointData>, A>(() => new DnD(true, this.logger))
            .on(handle)
            .then((_, i) => {
                anim.process(i);
            })
            .endOrCancel(() => {
                anim.end();
            });
    }

    /**
     * Creates a binding that uses the drag lock interaction.
     */
    public dragLockBinder<A>(accInit?: A): PartialPointSrcTgtTypedBinder<A> {
        return new UpdateBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<DragLock, SrcTgtPointsData<PointData>, A>(() => new DragLock(this.logger));
    }

    /**
     * Creates a binding that uses the KeyUp (key released) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public keyUpBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyUp, KeyData, A>(() => new KeyUp(this.logger, modifierAccepted));
    }

    /**
     * Creates a binding that uses the KeyDown (key pressed) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public keyDownBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyDown, KeyData, A>(() => new KeyDown(this.logger, modifierAccepted));
    }

    public keysDownBinder<A>(accInit?: A): PartialKeysTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeysDown, KeysData, A>(() => new KeysDown(this.logger));
    }

    public keysTypeBinder<A>(accInit?: A): PartialKeysTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeysTyped, KeysData, A>(() => new KeysTyped(this.logger));
    }

    public keyTypeBinder<A>(accInit?: A): PartialKeyTypedBinder<A> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, undefined, accInit)
            .usingInteraction<KeyTyped, KeyData, A>(() => new KeyTyped(this.logger));
    }

    public undoRedoBinder(undo: Widget<HTMLButtonElement>, redo: Widget<HTMLButtonElement>,
                          catchFn: ((err: unknown) => void) = ((): void => {})):
        [Binding<Undo, Interaction<WidgetData<HTMLButtonElement>>, WidgetData<HTMLButtonElement>, unknown>,
            Binding<Redo, Interaction<WidgetData<HTMLButtonElement>>, WidgetData<HTMLButtonElement>, unknown>] {
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
}
