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

import { CmdBinder } from "./api/CmdBinder";
import { AnonCmd } from "../command/AnonCmd";
import { AnonCmdBinder } from "./AnonCmdBinder";
import { InteractionBinder } from "./api/InteractionBinder";
import { ButtonPressed } from "../interaction/library/ButtonPressed";
import { WidgetData } from "../interaction/library/WidgetData";
import { Command } from "../command/Command";
import { UpdateBinder } from "./UpdateBinder";
import { BoxChecked } from "../interaction/library/BoxChecked";
import { ColorPicked } from "../interaction/library/ColorPicked";
import { ComboBoxSelected } from "../interaction/library/ComboBoxSelected";
import { SpinnerChanged } from "../interaction/library/SpinnerChanged";
import { InteractionUpdateBinder } from "./api/InteractionUpdateBinder";
import { DatePicked } from "../interaction/library/DatePicked";
import { InteractionImpl } from "../interaction/InteractionImpl";
import { InteractionData } from "../interaction/InteractionData";
import { FSM } from "../fsm/FSM";
import { CommandImpl } from "../command/CommandImpl";
import { BaseUpdateBinder } from "./api/BaseUpdateBinder";
import { BindingsObserver } from "./BindingsObserver";
import { TextInputChanged } from "../interaction/library/TextInputChanged";
import { MultiTouch } from "../interaction/library/MultiTouch";
import { MultiTouchData } from "../interaction/library/MultiTouchData";
import {Tap} from "../interaction/library/Tap";
import {TapData} from "../interaction/library/TapData";
import {LongTouch} from "../interaction/library/LongTouch";
import {TouchData} from "../interaction/library/TouchData";
import {Swipe} from "../interaction/library/Swipe";
import {SrcTgtTouchData} from "../interaction/library/SrcTgtTouchData";

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
    return new UpdateBinder<C, ButtonPressed, WidgetData<HTMLButtonElement>>(observer)
        .usingInteraction<ButtonPressed, WidgetData<HTMLButtonElement>>(() => new ButtonPressed());
}

export function checkboxBinder<C extends Command>(): InteractionBinder<BoxChecked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, BoxChecked, WidgetData<HTMLInputElement>>(observer)
        .usingInteraction<BoxChecked, WidgetData<HTMLInputElement>>(() => new BoxChecked());
}

export function colorPickerBinder<C extends Command>(): InteractionBinder<ColorPicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, ColorPicked, WidgetData<HTMLInputElement>>(observer)
        .usingInteraction<ColorPicked, WidgetData<HTMLInputElement>>(() => new ColorPicked());
}

export function comboBoxBinder<C extends Command>(): InteractionBinder<ComboBoxSelected, WidgetData<HTMLSelectElement>> {
    return new UpdateBinder<C, ComboBoxSelected, WidgetData<HTMLSelectElement>>(observer)
        .usingInteraction<ComboBoxSelected, WidgetData<HTMLSelectElement>>(() => new ComboBoxSelected());
}

export function spinnerBinder<C extends Command>(): InteractionUpdateBinder<SpinnerChanged, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, SpinnerChanged, WidgetData<HTMLInputElement>>(observer)
        .usingInteraction<SpinnerChanged, WidgetData<HTMLInputElement>>(() => new SpinnerChanged());
}

export function dateBinder<C extends Command>(): InteractionUpdateBinder<DatePicked, WidgetData<HTMLInputElement>> {
    return new UpdateBinder<C, DatePicked, WidgetData<HTMLInputElement>>(observer)
        .usingInteraction<DatePicked, WidgetData<HTMLInputElement>>(() => new DatePicked());
}

export function textInputBinder<C extends Command>(): InteractionUpdateBinder<TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>> {
    return new UpdateBinder<C, TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>>(observer)
        .usingInteraction<TextInputChanged, WidgetData<HTMLInputElement | HTMLTextAreaElement>>(() => new TextInputChanged());
}

/**
 * Creates a widget binding that uses the multi-touch user interaction.
 * @param nbTouches The number of required touches.
 * A multi-touch starts when all its touches have started.
 * A multi-touch ends when the number of required touches is greater than the number of touches.
 */
export function multiTouchBinder<C extends Command>(nbTouches: number): InteractionUpdateBinder<MultiTouch, MultiTouchData> {
    return new UpdateBinder<C, MultiTouch, MultiTouchData>(observer)
        .usingInteraction<MultiTouch, MultiTouchData>(() => new MultiTouch(nbTouches));
}

/**
 * Creates a widget binding that uses the tap user interaction.
 * @param nbTap The number of required taps.
 * If this number is not reached after a timeout, the interaction is cancelled.
 */
export function tapBinder<C extends Command>(nbTap: number): InteractionUpdateBinder<Tap, TapData> {
    return new UpdateBinder<C, Tap, TapData>(observer)
        .usingInteraction<Tap, TapData>(() => new Tap(nbTap));
}

/**
 * Creates a widget binding that uses the long touch interaction.
 * @param duration The duration of the touch to end the user interaction.
 * If this duration is not reached, the interaction is cancelled.
 */
export function longTouchBinder<C extends Command>(duration: number): InteractionUpdateBinder<LongTouch, TouchData> {
    return new UpdateBinder<C, LongTouch, TouchData>(observer)
        .usingInteraction<LongTouch, TouchData>(() => new LongTouch(duration));
}

/**
 * Creates a widget binding that uses the swipe interaction.
 * If this duration is not reached, the interaction is cancelled.
 * @param horizontal Defines whether the swipe is horizontal or vertical
 * @param minLength The minimal distance from the starting point to the release point for validating the swipe
 * @param pxTolerance The tolerance rate in pixels accepted while executing the swipe
 */
export function swipeBinder<C extends Command>(horizontal: boolean, minLength: number, pxTolerance: number):
InteractionUpdateBinder<Swipe, SrcTgtTouchData> {
    return new UpdateBinder<C, Swipe, SrcTgtTouchData>(observer)
        .usingInteraction<Swipe, SrcTgtTouchData>(() => new Swipe(horizontal, minLength, pxTolerance));
}
