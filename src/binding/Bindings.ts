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

import {CmdBinder} from "./api/CmdBinder";
import {AnonCmd} from "../command/AnonCmd";
import {AnonCmdBinder} from "./AnonCmdBinder";
import {InteractionBinder} from "./api/InteractionBinder";
import {ButtonPressed} from "../interaction/library/ButtonPressed";
import {WidgetData} from "../interaction/library/WidgetData";
import {Command} from "../command/Command";
import {UpdateBinder} from "./UpdateBinder";
import {BoxChecked} from "../interaction/library/BoxChecked";
import {ColorPicked} from "../interaction/library/ColorPicked";
import {ComboBoxSelected} from "../interaction/library/ComboBoxSelected";
import {SpinnerChanged} from "../interaction/library/SpinnerChanged";
import {InteractionUpdateBinder} from "./api/InteractionUpdateBinder";
import {DatePicked} from "../interaction/library/DatePicked";
import {InteractionImpl} from "../interaction/InteractionImpl";
import {InteractionData} from "../interaction/InteractionData";
import {FSM} from "../fsm/FSM";
import {CommandImpl} from "../command/CommandImpl";
import {BaseUpdateBinder} from "./api/BaseUpdateBinder";
import {BindingsObserver} from "./BindingsObserver";
import {TextInputChanged} from "../interaction/library/TextInputChanged";
import {MultiTouch} from "../interaction/library/MultiTouch";
import {MultiTouchData} from "../interaction/library/MultiTouchData";
import {Tap} from "../interaction/library/Tap";
import {TapData} from "../interaction/library/TapData";
import {LongTouch} from "../interaction/library/LongTouch";
import {TouchData} from "../interaction/library/TouchData";
import {Swipe} from "../interaction/library/Swipe";
import {SrcTgtTouchData} from "../interaction/library/SrcTgtTouchData";
import {Pan} from "../interaction/library/Pan";
import {Click} from "../interaction/library/Click";
import {PointData} from "../interaction/library/PointData";
import {Press} from "../interaction/library/Press";
import {DnD} from "../interaction/library/DnD";
import {SrcTgtPointsData} from "../interaction/library/SrcTgtPointsData";
import {DoubleClick} from "../interaction/library/DoubleClick";
import {DragLock} from "../interaction/library/DragLock";
import {HyperLinkClicked} from "../interaction/library/HyperLinkClicked";
import {KeyPressed} from "../interaction/library/KeyPressed";
import {KeyData} from "../interaction/library/KeyData";
import {KeysData} from "../interaction/library/KeysData";
import {KeysPressed} from "../interaction/library/KeysPressed";
import {KeysTyped} from "../interaction/library/KeysTyped";
import {KeyTyped} from "../interaction/library/KeyTyped";
import {Scroll} from "../interaction/library/Scroll";
import {ScrollData} from "../interaction/library/ScrollData";

let observer: BindingsObserver | undefined;

export function nodeBinder(): BaseUpdateBinder {
    return new UpdateBinder<CommandImpl, InteractionImpl<InteractionData, FSM>, InteractionData>(observer) as BaseUpdateBinder;
}

/**
 * Creates binding builder to build a binding between a KeysPressure interaction (done on a Node) and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @param cmd The anonymous command to produce.
 * @return The binding builder. Cannot be null.
 * @throws IllegalArgumentException If the given cmd is null.
 */
export function anonCmdBinder(cmd: () => void): CmdBinder<AnonCmd> {
    return new AnonCmdBinder(cmd, observer);
}

/**
 * Creates binding builder to build a binding between a button interaction and the given command type.
 * Do not forget to call bind() at the end of the build to execute the builder.
 * @return The binding builder.
 */
export function buttonBinder<C extends Command>(): InteractionBinder<ButtonPressed, WidgetData<HTMLButtonElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<ButtonPressed, WidgetData<HTMLButtonElement>>(() => new ButtonPressed());
}

export function checkboxBinder<C extends Command>(): InteractionBinder<BoxChecked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<BoxChecked, WidgetData<HTMLInputElement>>(() => new BoxChecked());
}

export function colorPickerBinder<C extends Command>(): InteractionBinder<ColorPicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<ColorPicked, WidgetData<HTMLInputElement>>(() => new ColorPicked());
}

export function comboBoxBinder<C extends Command>(): InteractionBinder<ComboBoxSelected, WidgetData<HTMLSelectElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<ComboBoxSelected, WidgetData<HTMLSelectElement>>(() => new ComboBoxSelected());
}

export function spinnerBinder<C extends Command>(): InteractionUpdateBinder<SpinnerChanged, WidgetData<HTMLInputElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<SpinnerChanged, WidgetData<HTMLInputElement>>(() => new SpinnerChanged());
}

export function dateBinder<C extends Command>(): InteractionUpdateBinder<DatePicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<DatePicked, WidgetData<HTMLInputElement>>(() => new DatePicked());
}

export function hyperlinkBinder<C extends Command>(): InteractionUpdateBinder<HyperLinkClicked, WidgetData<HTMLAnchorElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<HyperLinkClicked, WidgetData<HTMLAnchorElement>>(() => new HyperLinkClicked());
}

export function textInputBinder<C extends Command>(): InteractionUpdateBinder<TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>> {
    return new UpdateBinder(observer)
        .usingInteraction<TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>>(() => new TextInputChanged());
}

/**
 * Creates a widget binding that uses the multi-touch user interaction.
 * @param nbTouches The number of required touches.
 * A multi-touch starts when all its touches have started.
 * A multi-touch ends when the number of required touches is greater than the number of touches.
 */
export function multiTouchBinder<C extends Command>(nbTouches: number): InteractionUpdateBinder<MultiTouch, MultiTouchData> {
    return new UpdateBinder(observer)
        .usingInteraction<MultiTouch, MultiTouchData>(() => new MultiTouch(nbTouches));
}

/**
 * Creates a widget binding that uses the tap user interaction.
 * @param nbTap The number of required taps.
 * If this number is not reached after a timeout, the interaction is cancelled.
 */
export function tapBinder<C extends Command>(nbTap: number): InteractionUpdateBinder<Tap, TapData> {
    return new UpdateBinder(observer)
        .usingInteraction<Tap, TapData>(() => new Tap(nbTap));
}

/**
 * Creates a widget binding that uses the long touch interaction.
 * @param duration The duration of the touch to end the user interaction.
 * If this duration is not reached, the interaction is cancelled.
 */
export function longTouchBinder<C extends Command>(duration: number): InteractionUpdateBinder<LongTouch, TouchData> {
    return new UpdateBinder(observer)
        .usingInteraction<LongTouch, TouchData>(() => new LongTouch(duration));
}

/**
 * Creates a widget binding that uses the swipe interaction.
 * If this velocity is not reached, the interaction is cancelled.
 * @param horizontal Defines whether the swipe is horizontal or vertical
 * @param minVelocity The minimal minVelocity to reach for validating the swipe. In pixels per second.
 * @param minLength The minimal distance from the starting point to the release point for validating the swipe
 * @param pxTolerance The tolerance rate in pixels accepted while executing the swipe
 */
export function swipeBinder<C extends Command>(horizontal: boolean, minVelocity: number, minLength: number, pxTolerance: number):
InteractionUpdateBinder<Swipe, SrcTgtTouchData> {
    return new UpdateBinder(observer)
        .usingInteraction<Swipe, SrcTgtTouchData>(() => new Swipe(horizontal, minVelocity, minLength, pxTolerance));
}

/**
 * Creates a widget binding that uses the pan interaction.
 * @param horizontal Defines whether the pan is horizontal or vertical
 * @param minLength The minimal distance from the starting point to the release point for validating the pan
 * @param pxTolerance The tolerance rate in pixels accepted while executing the pan
 */
export function panBinder<C extends Command>(horizontal: boolean, minLength: number, pxTolerance: number):
InteractionUpdateBinder<Pan, SrcTgtTouchData> {
    return new UpdateBinder(observer)
        .usingInteraction<Pan, SrcTgtTouchData>(() => new Pan(horizontal, minLength, pxTolerance));
}

/**
 * Creates a widget binding that uses the click interaction.
 */
export function clickBinder<C extends Command>(): InteractionBinder<Click, PointData> {
    return new UpdateBinder(observer)
        .usingInteraction<Click, PointData>(() => new Click());
}

/**
 * Creates a widget binding that uses the double click interaction.
 */
export function dbleClickBinder<C extends Command>(): InteractionBinder<DoubleClick, PointData> {
    return new UpdateBinder(observer)
        .usingInteraction<DoubleClick, PointData>(() => new DoubleClick());
}

/**
 * Creates a widget binding that uses the mouse press interaction.
 */
export function pressBinder<C extends Command>(): InteractionBinder<Press, PointData> {
    return new UpdateBinder(observer)
        .usingInteraction<Press, PointData>(() => new Press());
}

/**
 * Creates a widget binding that uses the mouse scroll interaction.
 */
export function scrollBinder<C extends Command>(): InteractionBinder<Scroll, ScrollData> {
    return new UpdateBinder(observer)
        .usingInteraction<Scroll, ScrollData>(() => new Scroll());
}

/**
 * Creates a widget binding that uses the DnD interaction.
 * @param cancellable True: the FSM can be cancelled using the ESC key.
 * @param srcOnUpdate True: the source point will take the former target position on each update.
 */
export function dndBinder<C extends Command>(srcOnUpdate: boolean, cancellable: boolean): InteractionBinder<DnD, SrcTgtPointsData> {
    return new UpdateBinder(observer)
        .usingInteraction<DnD, SrcTgtPointsData>(() => new DnD(srcOnUpdate, cancellable));
}

/**
 * Creates a widget binding that uses the drag lock interaction.
 */
export function dragLockBinder<C extends Command>(): InteractionBinder<DragLock, SrcTgtPointsData> {
    return new UpdateBinder(observer)
        .usingInteraction<DragLock, SrcTgtPointsData>(() => new DragLock());
}

/**
 * Creates a widget binding that uses the key pressure interaction.
 * @param modifierAccepted True: the interaction will consider key modifiers.
 */
export function keyPressBinder<C extends Command>(modifierAccepted: boolean): InteractionBinder<KeyPressed, KeyData> {
    return new UpdateBinder(observer)
        .usingInteraction<KeyPressed, KeyData>(() => new KeyPressed(modifierAccepted));
}

/**
 * Creates a widget binding that uses the multiple key pressures interaction.
 */
export function keysPressBinder<C extends Command>(): InteractionBinder<KeysPressed, KeysData> {
    return new UpdateBinder(observer)
        .usingInteraction<KeysPressed, KeysData>(() => new KeysPressed());
}

/**
 * Creates a widget binding that uses the multiple key typings interaction.
 */
export function keysTypeBinder<C extends Command>(): InteractionBinder<KeysTyped, KeysData> {
    return new UpdateBinder(observer)
        .usingInteraction<KeysTyped, KeysData>(() => new KeysTyped());
}

/**
 * Creates a widget binding that uses the key typing interaction.
 */
export function keyTypeBinder<C extends Command>(): InteractionBinder<KeyTyped, KeyData> {
    return new UpdateBinder(observer)
        .usingInteraction<KeyTyped, KeyData>(() => new KeyTyped());
}
