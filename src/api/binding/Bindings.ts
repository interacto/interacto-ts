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

import type {Binding} from "./Binding";
import type {BindingsObserver} from "./BindingsObserver";
import type {VisitorBinding} from "./VisitorBinding";
import type {EltRef, Widget} from "../binder/BaseBinderBuilder";
import type {BaseUpdateBinder} from "../binder/BaseUpdateBinder";
import type {InteractionBinder} from "../binder/InteractionBinder";
import type {InteractionUpdateBinder} from "../binder/InteractionUpdateBinder";
import type {KeyInteractionBinder} from "../binder/KeyInteractionBinder";
import type {KeyInteractionUpdateBinder} from "../binder/KeyInteractionUpdateBinder";
import type {Command} from "../command/Command";
import type {FourTouchData} from "../interaction/FourTouchData";
import type {Interaction, InteractionsDataTypes} from "../interaction/Interaction";
import type {KeyData} from "../interaction/KeyData";
import type {KeysData} from "../interaction/KeysData";
import type {LineTouchData} from "../interaction/LineTouchData";
import type {MousePointsData} from "../interaction/MousePointsData";
import type {MultiTouchData} from "../interaction/MultiTouchData";
import type {PointData} from "../interaction/PointData";
import type {PointsData} from "../interaction/PointsData";
import type {RotationTouchData} from "../interaction/RotationTouchData";
import type {ScaleTouchData} from "../interaction/ScaleTouchData";
import type {ScrollData} from "../interaction/ScrollData";
import type {SrcTgtPointsData} from "../interaction/SrcTgtPointsData";
import type {TapsData} from "../interaction/TapsData";
import type {ThenData} from "../interaction/ThenData";
import type {ThreeTouchData} from "../interaction/ThreeTouchData";
import type {TouchData} from "../interaction/TouchData";
import type {GeneralTwoTouchData, TwoTouchData} from "../interaction/TwoTouchData";
import type {WheelData} from "../interaction/WheelData";
import type {WidgetData} from "../interaction/WidgetData";
import type {Logger} from "../logging/Logger";
import type {UndoHistoryBase} from "../undo/UndoHistoryBase";

/**
 * Defines a partly defined binder for buttons
 * @category API Binding
 */
export type PartialButtonTypedBinder<A = unknown> = InteractionBinder<Interaction<WidgetData<HTMLButtonElement>>, A>;
/**
 * Defines a partly defined binder for inputs
 * @category API Binding
 */
export type PartialInputTypedBinder<A = unknown> = InteractionBinder<Interaction<WidgetData<HTMLInputElement>>, A>;
/**
 * Defines a partly defined binder for selects
 * @category API Binding
 */
export type PartialSelectTypedBinder<A = unknown> = InteractionBinder<Interaction<WidgetData<HTMLSelectElement>>, A>;
/**
 * Defines a partly defined binder for spinners
 * @category API Binding
 */
export type PartialSpinnerTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<WidgetData<HTMLInputElement>>, A>;
/**
 * Defines a partly defined binder for anchors
 * @category API Binding
 */
export type PartialAnchorTypedBinder<A = unknown> = InteractionBinder<Interaction<WidgetData<HTMLAnchorElement>>, A>;
/**
 * Defines a partly defined binder for text inputs
 * @category API Binding
 */
export type PartialTextInputTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<WidgetData<HTMLInputElement | HTMLTextAreaElement>>, A>;
/**
 * Defines a partly defined binder for touch rotations
 * @category API Binding
 */
export type PartialRotateTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<RotationTouchData>, A>;
/**
 * Defines a partly defined binder for touch scalings
 * @category API Binding
 */
export type PartialScaleTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<ScaleTouchData>, A>;
/**
 * Defines a partly defined binder for two-touch pans
 * @category API Binding
 */
export type PartialTwoPanTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<LineTouchData & TwoTouchData>, A>;
/**
 * Defines a partly defined binder for two touch interactions
 * @category API Binding
 */
export type PartialTwoTouchTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<GeneralTwoTouchData>, A>;
/**
 * Defines a partly defined binder for three touch interactions
 * @category API Binding
 */
export type PartialThreeTouchTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<ThreeTouchData>, A>;
/**
 * Defines a partly defined binder for four touch interactions
 * @category API Binding
 */
export type PartialFourTouchTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<FourTouchData>, A>;
/**
 * Defines a partly defined binder for DnD touch interactions
 * @category API Binding
 */
export type PartialTouchSrcTgtTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<SrcTgtPointsData<TouchData>>, A>;
/**
 * Defines a partly defined binder for multi-touch interactions
 * @category API Binding
 */
export type PartialMultiTouchTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<MultiTouchData>, A>;
/**
 * Defines a partly defined binder for taps
 * @category API Binding
 */
export type PartialTapsTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<TapsData>, A>;
/**
 * Defines a partly defined binder for tap
 * @category API Binding
 */
export type PartialTapTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<TouchData>, A>;
/**
 * Defines a partly defined binder for touch types
 * @category API Binding
 */
export type PartialTouchTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<TouchData>, A>;
/**
 * Defines a partly defined binder for one point interactions
 * @category API Binding
 */
export type PartialPointTypedBinder<A = unknown> = InteractionBinder<Interaction<PointData>, A>;
/**
 * Defines a partly defined binder for wheel interactions
 * @category API Binding
 */
export type PartialWheelTypedBinder<A = unknown> = InteractionBinder<Interaction<WheelData>, A>;
/**
 * Defines a partly defined binder for scroll interactions
 * @category API Binding
 */
export type PartialScrollTypedBinder<A = unknown> = InteractionBinder<Interaction<ScrollData>, A>;
/**
 * Defines a partly defined binder for one point interactions that updates in time
 * @category API Binding
 */
export type PartialUpdatePointTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<PointData>, A>;
/**
 * Defines a partly defined binder for multi-point interactions
 * @category API Binding
 */
export type PartialPointsTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<MousePointsData>, A>;
/**
 * Defines a partly defined binder for DnD-like interactions
 * @category API Binding
 */
export type PartialPointSrcTgtTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<SrcTgtPointsData<PointData>>, A>;
/**
 * Defines a partly defined binder for key interactions
 * @category API Binding
 */
export type PartialKeyTypedBinder<A = unknown> = KeyInteractionBinder<Interaction<KeyData>, A>;
/**
 * Defines a partly defined binder for keys interactions
 * @category API Binding
 */
export type PartialKeysTypedBinder<A = unknown> = KeyInteractionUpdateBinder<Interaction<KeysData>, A>;
/**
 * Defines a partly defined binder for mouse or touch interactions
 * @category API Binding
 */
export type PartialPointOrTouchTypedBinder<A = unknown> = InteractionBinder<Interaction<PointData | TouchData>, A>;
/**
 * Defines a partly defined binder for mouse or touch tap interactions
 * @category API Binding
 */
export type PartialPointsOrTapsTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<MousePointsData | PointsData<TouchData>>, A>;
/**
 * Defines a partly defined binder for mouse or touch DnD interactions
 * @category API Binding
 */
export type PartialTouchMouseDnDTypedBinder<A = unknown> = InteractionUpdateBinder<Interaction<SrcTgtPointsData<PointData | TouchData>>, A>;
/**
 * Defines a partly defined binder for sequence of user interactions.
 * @category API Binding
 */
export type PartialThenBinder<XS extends Array<Interaction<object>>, A = unknown> =
    InteractionUpdateBinder<Interaction<ThenData<InteractionsDataTypes<XS>>>, A, ThenData<InteractionsDataTypes<XS>>>;

/**
 * A contextual object for creating binders and thus bindings.
 * allows the observation of the created bindings.
 * Provides an undo/redo history.
 * Why a pure abstract class and not an interface?
 * Because interfaces are not retained at runtime in TS and we want DI (that thus cannot inject interface types).
 * @typeParam H -- The undo history algorithm
 * @category API Binding
 */
export abstract class Bindings<H extends UndoHistoryBase> {
    /**
     * The undo/redo history of the current binding context
     */
    public abstract readonly undoHistory: H;

    public abstract readonly logger: Logger;

    public abstract nodeBinder<A>(accInit?: A): BaseUpdateBinder;

    /**
     * Creates binding builder to build a binding between a button interaction and the given command type.
     * Do not forget to call bind() at the end of the build to execute the builder.
     * @returns The binding builder.
     */
    public abstract buttonBinder<A>(accInit?: A): PartialButtonTypedBinder<A>;

    public abstract checkboxBinder<A>(accInit?: A): PartialInputTypedBinder<A>;

    public abstract colorPickerBinder<A>(accInit?: A): PartialInputTypedBinder<A>;

    public abstract comboBoxBinder<A>(accInit?: A): PartialSelectTypedBinder<A>;

    public abstract spinnerBinder<A>(accInit?: A): PartialSpinnerTypedBinder<A>;

    public abstract dateBinder<A>(accInit?: A): PartialInputTypedBinder<A>;

    public abstract hyperlinkBinder<A>(accInit?: A): PartialAnchorTypedBinder<A>;

    /**
     * Creates a binding that uses a text interaction. This binder takes as argument a timeout value:
     * using this text writing interaction, a user can write a sequence of letters and then stops for
     * more than x milliseconds (x is the value of timeout). After this delay the binding executes the command.
     * This is a mainstream optimisation that many text processing tools implement to limit the number of editing actions.
     * @param timeout - The timeout in milliseconds after which the interaction stops and the command produced.
     */
    public abstract textInputBinder<A>(timeout?: number, accInit?: A): PartialTextInputTypedBinder<A>;

    /**
     * Creates a binding that uses the touch DnD interaction (a DnD interaction that uses one touch).
     * This interaction works as a Drag-and-Drop interaction.
     */
    public abstract touchDnDBinder<A>(cancellable: boolean, accInit?: A): PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses the Reciprocal DnD interaction with a touch.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public abstract reciprocalTouchDnDBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses the multi-touch user interaction.
     * @param nbTouches - The number of required touches.
     * A multi-touch starts when all its touches have started.
     * A multi-touch ends when the number of required touches is greater than the number of touches.
     */
    public abstract multiTouchBinder<A>(nbTouches: number, accInit?: A): PartialMultiTouchTypedBinder<A>;

    /**
     * Creates a binding that uses two (DnD) touches.
     */
    public abstract twoTouchBinder<A>(accInit?: A): PartialTwoTouchTypedBinder<A>;

    /**
     * Creates a binding that uses three (DnD) touches.
     */
    public abstract threeTouchBinder<A>(accInit?: A): PartialThreeTouchTypedBinder<A>;

    /**
     * Creates a binding that uses four (DnD) touches.
     */
    public abstract fourTouchBinder<A>(accInit?: A): PartialFourTouchTypedBinder<A>;

    /**
     * Creates a binding that uses the taps user interaction.
     * @param tapsCount - The number of required taps.
     * If this number is not reached after a timeout, the interaction is cancelled.
     */
    public abstract tapsBinder<A>(tapsCount: number, accInit?: A): PartialTapsTypedBinder<A>;

    /**
     * Creates a binding that uses the tap user interaction (single tap).
     */
    public abstract tapBinder<A>(accInit?: A): PartialTapTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseDown (mouse button pressed) interaction.
     */
    public abstract touchStartBinder<A>(accInit?: A): PartialTouchTypedBinder<A>;

    /**
     * Creates a binding that uses the long touch interaction.
     * @param duration - The duration of the touch to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public abstract longTouchBinder<A>(duration: number, accInit?: A): PartialTouchTypedBinder<A>;

    /**
     * Creates a binding that uses the pan interaction (in all direction, one touch).
     * The involved user interaction is TouchDnD.
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panBinder<A>(cancellable: boolean, accInit?: A): PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a vertical pan (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panVerticalBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a vertical pan interaction (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panHorizontalBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a left pan interaction (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panLeftBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a right pan interaction (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panRightBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a top pan interaction (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panTopBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a bottom pan interaction (or swipe if minVelocity is used) interaction (one-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     * @param cancellable - Whether the DnD can be cancelled by interacting with a dwell-and-spring element.
     */
    public abstract panBottomBinder<A>(pxTolerance: number, cancellable: boolean, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTouchSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses a vertical pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanVerticalBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses a vertical pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanHorizontalBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses a left pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanLeftBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses a right pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanRightBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses a top pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanTopBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses a bottom pan interaction (two-touch).
     * @param minLength - The minimal distance from the starting point to the release point for validating the pan
     * @param minVelocity - The pan while be a swipe: the minimal minVelocity to reach for validating the swipe. In pixels per second.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the pan
     */
    public abstract twoPanBottomBinder<A>(pxTolerance: number, minLength?: number, minVelocity?: number, accInit?: A):
    PartialTwoPanTypedBinder<A>;

    /**
     * Creates a binding that uses the rotate interaction (two-touch interaction, with the first point
     * that must remain static).
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the rotation (i.e.
     * the acceptance rate when moving the fixation/first point).
     */
    public abstract rotateBinder<A>(pxTolerance: number, accInit?: A): PartialRotateTypedBinder<A>;

    /**
     * Creates a binding that uses the scale/pinch touch interaction.
     * @param pxTolerance - The tolerance rate in pixels accepted while executing the scale/pinch gesture
     */
    public abstract scaleBinder<A>(pxTolerance: number, accInit?: A): PartialScaleTypedBinder<A>;

    /**
     * Creates a binding that uses the click interaction.
     */
    public abstract clickBinder<A>(accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the Wheel (user uses a mouse scrolling wheel) interaction.
     */
    public abstract wheelBinder<A>(accInit?: A): PartialWheelTypedBinder<A>;

    /**
     * Creates a binding that uses the double click interaction.
     */
    public abstract dbleClickBinder<A>(accInit?: A): PartialUpdatePointTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseDown (mouse button pressed) interaction.
     */
    public abstract mouseDownBinder<A>(accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseUp (mouse button released) interaction.
     */
    public abstract mouseUpBinder<A>(accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the LongMouseDown
     * (mouse button pressed for a certain amount of time) interaction.
     * @param duration - The duration of the pressure to end the user interaction.
     * If this duration is not reached, the interaction is cancelled.
     */
    public abstract longMouseDownBinder<A>(duration: number, accInit?: A): PartialUpdatePointTypedBinder<A>;

    /**
     * Creates a binding for clicking n times.
     * @param nbClicks - The number of clicks to do.
     * If this number is not reached, the interaction is cancelled after a timeout of 1s.
     */
    public abstract clicksBinder<A>(nbClicks: number, accInit?: A): PartialPointsTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseEnter (mouse cursor enters the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public abstract mouseEnterBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseLeave (mouse cursor leaves the element) interaction.
     * @param withBubbling - True: event bubbling is enabled and events on child elements will be registered
     */
    public abstract mouseLeaveBinder<A>(withBubbling: boolean, accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the MouseMove (mouse cursor moves) interaction.
     */
    public abstract mouseMoveBinder<A>(accInit?: A): PartialPointTypedBinder<A>;

    /**
     * Creates a binding that uses the mouse scroll interaction.
     */
    public abstract scrollBinder<A>(accInit?: A): PartialScrollTypedBinder<A>;

    /**
     * Creates a binding that uses the DnD interaction.
     * @param cancellable - True: the escape key will cancels the DnD.
     */
    public abstract dndBinder<A>(cancellable: boolean, accInit?: A): PartialPointSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses the Reciprocal DnD interaction.
     * A spring handle can be pressed on a long click to return the element back to its previous position.
     * @param handle - The selectable part of the spring widget.
     * @param spring - The line between the handle and the previous position of the element.
     */
    public abstract reciprocalDndBinder<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>, accInit?: A):
    PartialPointSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses the drag lock interaction.
     */
    public abstract dragLockBinder<A>(accInit?: A): PartialPointSrcTgtTypedBinder<A>;

    /**
     * Creates a binding that uses the KeyDown (key pressed) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public abstract keyDownBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A>;

    /**
     * Creates a binding that uses the KeysDown (multiple keys pressed) interaction.
     */
    public abstract keysDownBinder<A>(accInit?: A): PartialKeysTypedBinder<A>;

    /**
     * Creates a binding that uses the KeyUp (key released) interaction.
     * @param modifierAccepted - True: the interaction will consider key modifiers.
     */
    public abstract keyUpBinder<A>(modifierAccepted: boolean, accInit?: A): PartialKeyTypedBinder<A>;

    /**
     * Creates a binding that uses the KeysType (multiple keys pressed then released) interaction.
     */
    public abstract keysTypeBinder<A>(accInit?: A): PartialKeysTypedBinder<A>;

    /**
     * Creates a binding that uses the KeyTyped (key pressed then released) interaction.
     */
    public abstract keyTypeBinder<A>(accInit?: A): PartialKeyTypedBinder<A>;

    /**
     * Creates a binding that uses either a mouse down or a touch start interaction.
     */
    public abstract mouseDownOrTouchStartBinder<A>(accInit?: A): PartialPointOrTouchTypedBinder<A>;

    /**
     * Creates a binding that uses either a taps or a clicks interaction.
     */
    public abstract tapsOrClicksBinder<A>(nbTap: number, accInit?: A): PartialPointsOrTapsTypedBinder<A>;

    /**
     * Creates a binding that uses either a tap or a click interaction.
     */
    public abstract tapOrClickBinder<A>(accInit?: A): PartialPointOrTouchTypedBinder<A>;

    /**
     * Creates a binding that uses either a longpress or a longtouch interaction.
     */
    public abstract longpressOrTouchBinder<A>(duration: number, accInit?: A): PartialPointOrTouchTypedBinder<A>;

    /**
     * Creates a binding that uses either a longpress or a longtouch interaction.
     */
    public abstract reciprocalMouseOrTouchDnD<A>(handle: EltRef<SVGCircleElement>, spring: EltRef<SVGLineElement>,
        accInit?: A): PartialTouchMouseDnDTypedBinder<A>;

    /**
     * Creates two bindings for undo and redo operations with buttons.
     * @param undo - The undo button
     * @param redo - The redo button
     * @param catchFn - The function that will treat the errors for both undo and redo bindings
     */
    public abstract undoRedoBinder(undo: Widget<HTMLButtonElement>, redo: Widget<HTMLButtonElement>, catchFn?: ((err: unknown) => void)):
    [Binding<Command, Interaction<WidgetData<HTMLButtonElement>>, unknown>,
        Binding<Command, Interaction<WidgetData<HTMLButtonElement>>, unknown>];

    /**
     * Create a binding that uses an ordered sequence of user interactions
     * @param interactions - The sequence of user interaction
     */
    public abstract combine<XS extends Array<Interaction<object>>, A>(interactions: XS, accInit?: A):
    PartialThenBinder<XS, A>;

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

    /**
     * Visiting the binding.
     * @param visitor - The visitor.
     */
    public abstract acceptVisitor(visitor: VisitorBinding): void;
}
