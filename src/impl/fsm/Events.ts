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
    mouseDown = "mousedown",
    mouseUp = "mouseup",
    mouseMove = "mousemove",
    keyDown = "keydown",
    keyUp = "keyup",
    click = "click",
    auxclick = "auxclick",
    input = "input",
    scroll = "scroll",
    change = "change",
    touchstart = "touchstart",
    touchend = "touchend",
    touchmove = "touchmove"
}

/**
 * Searches for a touch.
 * @param idToFind The ID of the touch to find.
 * @param touches The list of touches to search in.
 */
export function getTouch(touches: TouchList, idToFind: number | undefined): Touch | undefined {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < touches.length; i++) {
        if (touches[i].identifier === idToFind) {
            return touches[i];
        }
    }
    return undefined;
}

/**
 * Checks whether the given event type is a touch event.
 * @param eventType The event type to check.
 */
export function isTouchEvent(eventType: string): boolean {
    return eventType === EventRegistrationToken.touchstart ||
    eventType === EventRegistrationToken.touchend ||
    eventType === EventRegistrationToken.touchmove;
}

/**
 * Checks whether the given event type is a mouse event.
 * @param eventType The event type to check.
 */
export function isMouseEvent(eventType: string): boolean {
    return eventType === EventRegistrationToken.mouseDown ||
    eventType === EventRegistrationToken.mouseUp ||
    eventType === EventRegistrationToken.mouseMove ||
    eventType === EventRegistrationToken.click ||
    eventType === EventRegistrationToken.auxclick;
}

/**
 * Checks whether the given event type is a key event.
 * @param eventType The event type to check.
 */
export function isKeyEvent(eventType: string): boolean {
    return eventType === EventRegistrationToken.keyDown ||
    eventType === EventRegistrationToken.keyUp;
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
    return event instanceof KeyboardEvent && event.type === EventRegistrationToken.keyDown;
}

export function isKeyUpEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === EventRegistrationToken.keyUp;
}

export function isMouseDownEvent(event: Event): event is MouseEvent {
    return event instanceof MouseEvent && event.type === EventRegistrationToken.mouseDown;
}

export function isScrollEvent(event: Event): event is UIEvent {
    return event instanceof UIEvent && event.type === EventRegistrationToken.scroll;
}

export enum KeyCode {
    escape = 27
}
