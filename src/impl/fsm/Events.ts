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
 * @param touches - The list of touches to search in.
 * @param idToFind - The ID of the touch to find.
 * @returns The found touch or nothing.
 */
export function getTouch(touches: TouchList, idToFind?: number): Touch | undefined {
    for (const touch of touches) {
        if (touch.identifier === idToFind) {
            return touch;
        }
    }
    return undefined;
}

/**
 * Tests whether the given object is a HTML button.
 * @param target - The object to test.
 * @returns True: the object is a HTML button
 */
export function isButton(target: EventTarget): target is HTMLButtonElement {
    return target instanceof HTMLButtonElement;
}

/**
 * Tests whether the given object is a HTML checkbox.
 * @param target - The object to test.
 * @returns True: the object is a HTML checkbox.
 */
export function isCheckBox(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "checkbox";
}

/**
 * Tests whether the given object is a HTML ColorChoice.
 * @param target - The object to test.
 * @returns True: the object is a HTML ColorChoice.
 */
export function isColorChoice(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "color";
}

/**
 * Tests whether the given object is a HTML ComboBox.
 * @param target - The object to test.
 * @returns True: the object is a HTML ComboBox
 */
export function isComboBox(target: EventTarget): target is HTMLSelectElement {
    return target instanceof HTMLSelectElement;
}

/**
 * Tests whether the given object is a HTML DatePicker.
 * @param target - The object to test.
 * @returns True: the object is a HTML DatePicker
 */
export function isDatePicker(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "date";
}

/**
 * Tests whether the given object is a HTML spinner.
 * @param target - The object to test.
 * @returns True: the object is a HTML spinner
 */
export function isSpinner(target: EventTarget): target is HTMLInputElement {
    return target instanceof HTMLInputElement && target.getAttribute("type") === "number";
}

/**
 * Tests whether the given object is a HTML hyperlink.
 * @param target - The object to test.
 * @returns True: the object is a HTML hyperlink
 */
export function isHyperLink(target: EventTarget): target is HTMLAnchorElement {
    return target instanceof HTMLAnchorElement;
}

/**
 * Tests whether the given object is a HTML text input.
 * @param target - The object to test.
 * @returns True: the object is a HTML text input
 */
export function isTextInput(target: EventTarget): target is HTMLInputElement | HTMLTextAreaElement {
    return (target instanceof HTMLInputElement && target.getAttribute("type") === "text") ||
        target instanceof HTMLTextAreaElement;
}

/**
 * Tests whether the given object is a keydown event.
 * @param event - The object to test.
 * @returns True: the object is a keydown event
 */
export function isKeyDownEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === "keydown";
}

/**
 * Tests whether the given object is a keyup event.
 * @param event - The object to test.
 * @returns True: the object is a keyup event
 */
export function isKeyUpEvent(event: Event): event is KeyboardEvent {
    return event instanceof KeyboardEvent && event.type === "keyup";
}

/**
 * A list of key codes.
 */
export enum KeyCode {
    escape = 27
}
