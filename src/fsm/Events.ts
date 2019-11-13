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

export enum EventRegistrationToken {
    MouseDown = "mousedown",
    MouseUp = "mouseup",
    MouseMove = "mousemove",
    KeyDown = "keydown",
    KeyUp = "keyup",
    Click = "click",
    Input = "input",
    Scroll = "scroll",
    Change = "change"
}

export function isButton(target: EventTarget): target is HTMLButtonElement {
    return target instanceof HTMLButtonElement;
}

export function isCheckBox(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "checkbox";
}

export function isColorChoice(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "color";
}

export function isComboBox(target: EventTarget): target is HTMLSelectElement {
    return target instanceof HTMLSelectElement;
}

export function isDatePicker(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "date";
}

export function isSpinner(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "number";
}

export function isHyperLink(target: EventTarget): target is HTMLAnchorElement {
    return target instanceof HTMLAnchorElement;
}

export function isTextInput(target: EventTarget): target is HTMLInputElement | HTMLTextAreaElement {
    return (target instanceof HTMLInputElement && target.getAttribute("type") === "text") ||
        target instanceof HTMLTextAreaElement;
}

export function isKeyDownEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === EventRegistrationToken.KeyDown;
}

export function isKeyUpEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === EventRegistrationToken.KeyUp;
}

export function isMouseDownEvent(event: Event): event is MouseEvent {
    return event instanceof MouseEvent && event.type === EventRegistrationToken.MouseDown;
}

export function isScrollEvent(event: Event): event is UIEvent {
    return event instanceof UIEvent && event.type === EventRegistrationToken.Scroll;
}

export enum KeyCode {
    ESCAPE = 27
}
