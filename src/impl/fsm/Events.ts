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

/**
 * Searches for a touch.
 * @param idToFind - The ID of the touch to find.
 * @param touches - The list of touches to search in.
 */
export function getTouch(touches: TouchList, idToFind?: number): Touch | undefined {
    for (const touch of touches) {
        if (touch.identifier === idToFind) {
            return touch;
        }
    }
    return undefined;
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
    return event instanceof KeyboardEvent && event.type === "keydown";
}

export function isKeyUpEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === "keyup";
}

export enum KeyCode {
    escape = 27
}
