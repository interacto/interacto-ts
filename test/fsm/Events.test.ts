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
    isTextInput, KeyCode} from "../../src/fsm/Events";
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
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isButton(elt1)).toBeTruthy();
    });
    test("isButton KO", () => {
        document.documentElement.innerHTML = "<html><div><input id='cb' type='checkbox'/></div></html>";
        const elt1 = document.getElementById("cb") as Element;
        expect(isButton(elt1)).toBeFalsy();
    });

    test("isCheckBox OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='cb' type='checkbox'/></div></html>";
        const elt1 = document.getElementById("cb") as Element;
        expect(isCheckBox(elt1)).toBeTruthy();
    });

    test("isCheckBox KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isCheckBox(elt1)).toBeFalsy();
    });

    test("isColorChoice KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isColorChoice(elt1)).toBeFalsy();
    });

    test("isColorChoice OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='col1' type='color'/></div></html>";
        const elt1 = document.getElementById("col1") as Element;
        expect(isColorChoice(elt1)).toBeTruthy();
    });

    test("isComboBox KO", () => {
        document.documentElement.innerHTML = "<html><div><input id='comb1' list='test'><datalist id='test'>" +
        "<option value='test1'>Test1</option> </datalist></input></div></html>";
        const elt1 = document.getElementById("comb1") as Element;
        expect(isComboBox(elt1)).toBeFalsy();
    });

    test("isComboBox OK", () => {
        document.documentElement.innerHTML = "<html><div><select id='id'><option value='v1'>Volvo</option></select>/div></html>";
        const elt1 = document.getElementById("id") as Element;
        expect(isComboBox(elt1)).toBeTruthy();
    });

    test("isDatePicker KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isDatePicker(elt1)).toBeFalsy();
    });

    test("isDatePicker OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='dt1' type='date' /></div></html>";
        const elt1 = document.getElementById("dt1") as Element;
        expect(isDatePicker(elt1)).toBeTruthy();
    });

    test("isSpinner KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isSpinner(elt1)).toBeFalsy();
    });

    test("isSpinner OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='sp1' type='number'></div></html>";
        const elt1 = document.getElementById("sp1") as Element;
        expect(isSpinner(elt1)).toBeTruthy();
    });

    test("isHyperLink KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isHyperLink(elt1)).toBeFalsy();
    });

    test("isHyperLink OK", () => {
        document.documentElement.innerHTML = "<html><div><a id='url1' href=''>Test</a></div></html>";
        const elt1 = document.getElementById("url1") as Element;
        expect(isHyperLink(elt1)).toBeTruthy();
    });

    test("isTextInput KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isTextInput(elt1)).toBeFalsy();
    });

    test("isTextInput OK input", () => {
        document.documentElement.innerHTML = "<html><div><input id='txt' type='text'/></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isTextInput(elt1)).toBeTruthy();
    });

    test("isTextInput OK textarea", () => {
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
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
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isMouseDownEvent(createMouseEvent(EventRegistrationToken.mouseUp, elt1))).toBeFalsy();
    });

    test("isMouseDownEvent OK", () => {
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
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
