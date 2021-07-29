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


import type {EventType} from "../../api/fsm/EventType";
import {eventTypes} from "../../api/fsm/EventType";


export function isEventType(evtType: string): evtType is EventType {
    return eventTypes.includes(evtType as EventType);
}

/**
 * Searches for a touch.
 * @param idToFind - The ID of the touch to find.
 * @param touches - The list of touches to search in.
 */
export function getTouch(touches: TouchList, idToFind?: number): Touch | undefined {
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
 * @param eventType - The event type to check.
 */
export function isTouchEvent(eventType: EventType): boolean {
    return eventType === "touchstart" || eventType === "touchend" || eventType === "touchmove";
}

/**
 * Checks whether the given event type is a mouse event.
 * @param eventType - The event type to check.
 */
export function isMouseEvent(eventType: EventType): boolean {
    return eventType === "mousedown" || eventType === "mouseup" || eventType === "mousemove" ||
    eventType === "mouseover" || eventType === "click" || eventType === "auxclick" || eventType === "mouseout" ||
    eventType === "mouseenter" || eventType === "mouseleave" || eventType === "wheel";
}

/**
 * Checks whether the given event type is a key event.
 * @param eventType - The event type to check.
 */
export function isKeyEvent(eventType: EventType): boolean {
    return eventType === "keydown" || eventType === "keyup";
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
    return event instanceof KeyboardEvent && isEventType(event.type) && event.type === "keydown";
}

export function isKeyUpEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && isEventType(event.type) && event.type === "keyup";
}

export function isMouseDownEvent(event: Event): event is MouseEvent {
    return event instanceof MouseEvent && isEventType(event.type) && event.type === "mousedown";
}

export function isScrollEvent(event: Event): event is UIEvent {
    return event instanceof UIEvent && isEventType(event.type) && event.type === "scroll";
}

export enum KeyCode {
    escape = 27
}
