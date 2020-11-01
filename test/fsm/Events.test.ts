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

import {EventRegistrationToken, isButton, isCheckBox, isColorChoice, isComboBox, isDatePicker,
    isHyperLink, isKeyDownEvent, isKeyUpEvent, isMouseDownEvent, isScrollEvent, isSpinner,
    isTextInput, KeyCode} from "../../src/impl/fsm/Events";
import {createKeyEvent, createMouseEvent, createUIEvent} from "../interaction/StubEvents";


describe("checking event token", () => {
    test("check event token mouse down", () => {
        expect(EventRegistrationToken.mouseDown).toStrictEqual("mousedown");
    });

    test("check event token mouse up", () => {
        expect(EventRegistrationToken.mouseUp).toStrictEqual("mouseup");
    });

    test("check event token mouse move", () => {
        expect(EventRegistrationToken.mouseMove).toStrictEqual("mousemove");
    });

    test("check event token key up", () => {
        expect(EventRegistrationToken.keyUp).toStrictEqual("keyup");
    });

    test("check event token key down", () => {
        expect(EventRegistrationToken.keyDown).toStrictEqual("keydown");
    });

    test("check event token change", () => {
        expect(EventRegistrationToken.change).toStrictEqual("change");
    });

    test("check event token click", () => {
        expect(EventRegistrationToken.click).toStrictEqual("click");
    });

    test("check event token scroll", () => {
        expect(EventRegistrationToken.scroll).toStrictEqual("scroll");
    });

    test("check event token input", () => {
        expect(EventRegistrationToken.input).toStrictEqual("input");
    });
});

describe("checking is widget functions", () => {
    test("isButton OK", () => {
        const elt1 = document.createElement("button");
        expect(isButton(elt1)).toBeTruthy();
    });
    test("isButton KO", () => {
        const elt1 = document.createElement("input");
        expect(isButton(elt1)).toBeFalsy();
    });

    test("isCheckBox OK", () => {
        const elt1 = document.createElement("input");
        elt1.type = "checkbox";
        expect(isCheckBox(elt1)).toBeTruthy();
    });

    test("isCheckBox KO", () => {
        const elt1 = document.createElement("button");
        expect(isCheckBox(elt1)).toBeFalsy();
    });

    test("isColorChoice KO", () => {
        const elt1 = document.createElement("button");
        expect(isColorChoice(elt1)).toBeFalsy();
    });

    test("isColorChoice OK", () => {
        const elt1 = document.createElement("input");
        elt1.type = "color";
        expect(isColorChoice(elt1)).toBeTruthy();
    });

    test("isComboBox KO", () => {
        const elt1 = document.createElement("input");
        expect(isComboBox(elt1)).toBeFalsy();
    });

    test("isComboBox OK", () => {
        const elt1 = document.createElement("select");
        expect(isComboBox(elt1)).toBeTruthy();
    });

    test("isDatePicker KO", () => {
        const elt1 = document.createElement("button");
        expect(isDatePicker(elt1)).toBeFalsy();
    });

    test("isDatePicker OK", () => {
        const elt1 = document.createElement("input");
        elt1.type = "date";
        expect(isDatePicker(elt1)).toBeTruthy();
    });

    test("isSpinner KO", () => {
        const elt1 = document.createElement("button");
        expect(isSpinner(elt1)).toBeFalsy();
    });

    test("isSpinner OK", () => {
        const elt1 = document.createElement("input");
        elt1.type = "number";
        expect(isSpinner(elt1)).toBeTruthy();
    });

    test("isHyperLink KO", () => {
        const elt1 = document.createElement("button");
        expect(isHyperLink(elt1)).toBeFalsy();
    });

    test("isHyperLink OK", () => {
        const elt1 = document.createElement("a");
        expect(isHyperLink(elt1)).toBeTruthy();
    });

    test("isTextInput KO", () => {
        const elt1 = document.createElement("button");
        expect(isTextInput(elt1)).toBeFalsy();
    });

    test("isTextInput OK input", () => {
        const elt1 = document.createElement("input");
        elt1.type = "text";
        expect(isTextInput(elt1)).toBeTruthy();
    });

    test("isTextInput OK textarea", () => {
        const elt1 = document.createElement("textarea");
        expect(isTextInput(elt1)).toBeTruthy();
    });
});

describe("checking event functions", () => {
    test("isKeyDownEvent KO", () => {
        expect(isKeyDownEvent(createKeyEvent(EventRegistrationToken.keyUp, "a"))).toBeFalsy();
    });

    test("isKeyDownEvent OK", () => {
        expect(isKeyDownEvent(createKeyEvent(EventRegistrationToken.keyDown, "a"))).toBeTruthy();
    });


    test("isKeyUpEvent KO", () => {
        expect(isKeyUpEvent(createKeyEvent(EventRegistrationToken.keyDown, "b"))).toBeFalsy();
    });

    test("isKeyUpEvent OK", () => {
        expect(isKeyUpEvent(createKeyEvent(EventRegistrationToken.keyUp, "b"))).toBeTruthy();
    });

    test("isMouseDownEvent KO", () => {
        const elt1 = document.createElement("textarea");
        expect(isMouseDownEvent(createMouseEvent(EventRegistrationToken.mouseUp, elt1))).toBeFalsy();
    });

    test("isMouseDownEvent OK", () => {
        const elt1 = document.createElement("textarea");
        expect(isMouseDownEvent(createMouseEvent(EventRegistrationToken.mouseDown, elt1))).toBeTruthy();
    });

    test("isScrollEvent KO", () => {
        expect(isScrollEvent(createUIEvent(EventRegistrationToken.mouseUp))).toBeFalsy();
    });

    test("isScrollEvent OK", () => {
        expect(isScrollEvent(createUIEvent(EventRegistrationToken.scroll))).toBeTruthy();
    });
});

describe("key codes", () => {
    test("key ESCAPE", () => {
        expect(KeyCode.escape).toStrictEqual(27);
    });
});
