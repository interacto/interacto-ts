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

import type {BindingsObserver} from "./BindingsObserver";
import type {InteractionBinder} from "../binder/InteractionBinder";
import type {Interaction} from "../interaction/Interaction";
import type {WidgetData} from "../interaction/WidgetData";
import type {InteractionUpdateBinder} from "../binder/InteractionUpdateBinder";
import type {SrcTgtPointsData} from "../interaction/SrcTgtPointsData";
import type {TouchData} from "../interaction/TouchData";
import type {MultiTouchData} from "../interaction/MultiTouchData";
import type {TapData} from "../interaction/TapData";
import type {PointData} from "../interaction/PointData";
import type {ScrollData} from "../interaction/ScrollData";
import type {PointsData} from "../interaction/PointsData";
import type {KeyInteractionBinder} from "../binder/KeyInteractionBinder";
import type {KeyData} from "../interaction/KeyData";
import type {KeyInteractionUpdateBinder} from "../binder/KeyInteractionUpdateBinder";
import type {KeysData} from "../interaction/KeysData";
import type {BaseUpdateBinder} from "../binder/BaseUpdateBinder";
import type {EltRef, Widget} from "../binder/BaseBinderBuilder";
import type {Binding} from "./Binding";
import type {Undo} from "../../impl/command/library/Undo";
import type {Redo} from "../../impl/command/library/Redo";
import type {Logger} from "../logging/Logger";
import type {WheelData} from "../interaction/WheelData";
import type {UndoHistoryBase} from "../undo/UndoHistoryBase";

export type PartialButtonBinder = InteractionBinder<Interaction<WidgetData<HTMLButtonElement>>, WidgetData<HTMLButtonElement>>;
export type PartialInputBinder = InteractionBinder<Interaction<WidgetData<HTMLInputElement>>, WidgetData<HTMLInputElement>>;
export type PartialSelectBinder = InteractionBinder<Interaction<WidgetData<HTMLSelectElement>>, WidgetData<HTMLSelectElement>>;
export type PartialSpinnerBinder = InteractionUpdateBinder<Interaction<WidgetData<HTMLInputElement>>, WidgetData<HTMLInputElement>>;
export type PartialAnchorBinder = InteractionBinder<Interaction<WidgetData<HTMLAnchorElement>>, WidgetData<HTMLAnchorElement>>;
export type PartialTextInputBinder = InteractionUpdateBinder<Interaction<WidgetData<HTMLInputElement | HTMLTextAreaElement>>,
WidgetData<HTMLInputElement | HTMLTextAreaElement>>;
export type PartialTouchSrcTgtBinder = InteractionUpdateBinder<Interaction<SrcTgtPointsData<TouchData>>, SrcTgtPointsData<TouchData>>;
export type PartialMultiTouchBinder = InteractionUpdateBinder<Interaction<MultiTouchData>, MultiTouchData>;
export type PartialTapBinder = InteractionUpdateBinder<Interaction<TapData>, TapData>;
export type PartialTouchBinder = InteractionUpdateBinder<Interaction<TouchData>, TouchData>;
export type PartialPointBinder = InteractionBinder<Interaction<PointData>, PointData>;
export type PartialWheelBinder = InteractionBinder<Interaction<WheelData>, WheelData>;
export type PartialScrollBinder = InteractionBinder<Interaction<ScrollData>, ScrollData>;
export type PartialUpdatePointBinder = InteractionUpdateBinder<Interaction<PointData>, PointData>;
export type PartialPointsBinder = InteractionUpdateBinder<Interaction<PointsData>, PointsData>;
export type PartialPointSrcTgtBinder = InteractionUpdateBinder<Interaction<SrcTgtPointsData<PointData>>, SrcTgtPointsData<PointData>>;
export type PartialKeyBinder = KeyInteractionBinder<Interaction<KeyData>, KeyData>;
export type PartialKeysBinder = KeyInteractionUpdateBinder<Interaction<KeysData>, KeysData>;

/**
 * A contextual object for creating binders and thus bindings.
 * allows the observation of the created bindings.
 * Provides an undo/redo history.
 * Why a pure abstract class and not an interface?
 * Because interfaces are not retained at runtime in TS and we want DI (that thus cannot inject interface types).
 * @typeParam H -- The undo history algorithm
 */
export abstract class Bindings<H extends UndoHistoryBase> {
    /**
     * The undo/redo history of the current binding context
     */
    public abstract readonly undoHistory: H;

    public abstract readonly logger: Logger;

    public abstract nodeBinder(): BaseUpdateBinder;

    /**
     * Creates binding builder to build a binding between a button interaction and the given command type.
     * Do not forget to call bind() at the end of the build to execute the builder.
     * @returns The binding builder.
     */
    public abstract buttonBinder(): PartialButtonBinder;

    public abstract checkboxBinder(): PartialInputBinder;

    public abstract colorPickerBinder(): PartialInputBinder;

    public abstract comboBoxBinder(): PartialSelectBinder;

    public abstract spinnerBinder(): PartialSpinnerBinder;

    public abstract dateBinder(): PartialInputBinder;

    public abstract hyperlinkBinder(): PartialAnchorBinder;

    /**
     * Creates a binding that uses a text interaction. This binder takes as argument a timeout value:
     * using this text writing interaction, a user can write a sequence of letters and then stops for
     * more than x milliseconds (x is the value of timeout). After this delay the binding executes the command.
     * This is a mainstream optimisation that many text processing tools implement to limit the number of editing actions.
     * @param timeout - The timeout in milliseconds after which the interaction stops and the command produced.
     */
    public abstract textInputBinder(timeout?: number): PartialTextInputBinder;

    /**
     * Creates a binding that uses the touch DnD interaction (a DnD interaction that uses one touch).
     * This interaction works as a Drag-and-Drop interaction.
     */
    public abstract touchDnDBinder(cancellable: boolean): PartialTouchSrcTgtBinder;

    /**
     * Creates a binding that uses the Reciprocal DnD interaction with a touch.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public abstract reciprocalTouchDnDBinder(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>): PartialTouchSrcTgtBinder;

    /**
     * Creates a binding that uses the multi-touch user interaction.
     * @param nbTouches - The number of required touches.
     * A multi-touch starts when all its touches have started.
     * A multi-touch ends when the number of required touches is greater than the number of touches.
     */
    public abstract multiTouchBinder(nbTouches: number): PartialMultiTouchBinder;

    /**
     * Creates a binding that uses the tap user interaction.
     * @param nbTap - The number of required taps.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public abstract tapBinder(nbTap: number): PartialTapBinder;

    /**
     * Creates a binding that uses the long touch interaction.
     * @param duration - The duration of the touch to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public abstract longTouchBinder(duration: number): PartialTouchBinder;

    /**
     * Creates a binding that uses the swipe interaction.
     * If this velocity is not reached, the interaction is cancelled.
     * @param horizontal - Defines whether the swipe is horizontal or vertical
     * @param minVelocity - The minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param minLength - The minimal distance from the starting point to the release point for validating the swipe
     * @param nbTouches - The number of touches required to start the interaction
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the swipe
     */
    public abstract swipeBinder(horizontal: boolean, minVelocity: number, minLength: number, nbTouches: number,
        pxTolerance: number): PartialMultiTouchBinder;

    /**
     * Creates a binding that uses the pan interaction.
     * @param horizontal - Defines whether the pan is horizontal or vertical
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param nbTouches - The number of touches required to start the interaction
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract panBinder(horizontal: boolean, minLength: number, nbTouches: number, pxTolerance: number): PartialMultiTouchBinder;

    /**
     * Creates a binding that uses the pinch interaction.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pinch
     */
    public abstract pinchBinder(pxTolerance: number): PartialMultiTouchBinder;

    /**
     * Creates a binding that uses the click interaction.
     */
    public abstract clickBinder(): PartialPointBinder;

    /**
     * Creates a binding that uses the Wheel (user uses a mouse scrolling wheel) interaction.
     */
    public abstract wheelBinder(): PartialWheelBinder;

    /**
     * Creates a binding that uses the double click interaction.
     */
    public abstract dbleClickBinder(): PartialUpdatePointBinder;

    /**
     * Creates a binding that uses the MouseDown (mouse button pressed) interaction.
     */
    public abstract mouseDownBinder(): PartialPointBinder;

    /**
     * Creates a binding that uses the MouseUp (mouse button released) interaction.
     */
    public abstract mouseUpBinder(): PartialPointBinder;

    /**
     * Creates a binding that uses the LongMouseDown
     * (mouse button pressed for a certain amount of time) interaction.
     * @param duration - The duration of the pressure to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public abstract longMouseDownBinder(duration: number): PartialUpdatePointBinder;

    /**
     * Creates a binding for clicking n times.
     * @param nbClicks - The number of clicks to do.
     * If this number is not reached, the interaction is cancelled after a timeout of 1s.
     */
    public abstract clicksBinder(nbClicks: number): PartialPointsBinder;

    /**
     * Creates a binding that uses the MouseEnter (mouse cursor enters the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public abstract mouseEnterBinder(withBubbling: boolean): PartialPointBinder;

    /**
     * Creates a binding that uses the MouseLeave (mouse cursor leaves the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public abstract mouseLeaveBinder(withBubbling: boolean): PartialPointBinder;

    /**
     * Creates a binding that uses the MouseMove (mouse cursor moves) interaction.
     */
    public abstract mouseMoveBinder(): PartialPointBinder;

    /**
     * Creates a binding that uses the mouse scroll interaction.
     */
    public abstract scrollBinder(): PartialScrollBinder;

    /**
     * Creates a binding that uses the DnD interaction.
     * @param cancellable - True: the escape key will cancels the DnD.
     */
    public abstract dndBinder(cancellable: boolean): PartialPointSrcTgtBinder;

    /**
     * Creates a binding that uses the Reciprocal DnD interaction.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public abstract reciprocalDndBinder(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>): PartialPointSrcTgtBinder;

    /**
     * Creates a binding that uses the drag lock interaction.
     */
    public abstract dragLockBinder(): PartialPointSrcTgtBinder;

    /**
     * Creates a binding that uses the KeyDown (key pressed) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public abstract keyDownBinder(modifierAccepted: boolean): PartialKeyBinder;

    /**
     * Creates a binding that uses the KeysDown (multiple keys pressed) interaction.
     */
    public abstract keysDownBinder(): PartialKeysBinder;

    /**
     * Creates a binding that uses the KeyUp (key released) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public abstract keyUpBinder(modifierAccepted: boolean): PartialKeyBinder;

    /**
     * Creates a binding that uses the KeysType (multiple keys pressed then released) interaction.
     */
    public abstract keysTypeBinder(): PartialKeysBinder;

    /**
     * Creates a binding that uses the KeyTyped (key pressed then released) interaction.
     */
    public abstract keyTypeBinder(): PartialKeyBinder;

    /**
     * Creates two bindings for undo and redo operations with buttons.
     * @param undo - The undo button
     * @param redo - The redo button
     * @param catchFn - The function that will treat the errors for both undo and redo bindings
     */
    public abstract undoRedoBinder(undo: Widget<HTMLButtonElement>, redo: Widget<HTMLButtonElement>, catchFn?: ((err: unknown) => void)):
    [Binding<Undo, Interaction<WidgetData<HTMLButtonElement>>, WidgetData<HTMLButtonElement>>,
        Binding<Redo, Interaction<WidgetData<HTMLButtonElement>>, WidgetData<HTMLButtonElement>>];

    /**
     * Clears all the data of this binding context:
     * the possible current `BindingsObserver` object;
     * the undo/redo history.
     */
    public abstract clear(): void;

    /**
     * Sets the current `BindingsObserver` object. Cleans the potential former global `BindingsObserver` object.
     * @param obs - The new `BindingsObserver` object to consider. Can be undefined.
     */
    public abstract setBindingObserver(obs?: BindingsObserver): void;
}
