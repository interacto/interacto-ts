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
import { EventRegistrationToken, isButton, isCheckBox, isColorChoice, isComboBox,
    isDatePicker, isSpinner, isHyperLink, isTextInput, isKeyDownEvent, isKeyUpEvent,
    isMouseDownEvent, isScrollEvent, KeyCode } from "../../src";
import { createKeyEvent, createMouseEvent, createUIEvent } from "../interaction/StubEvents";


describe("checking event token", () => {
    test("check event token mouse down", () => {
        expect(EventRegistrationToken.MouseDown).toEqual("mousedown");
    });

    test("check event token mouse up", () => {
        expect(EventRegistrationToken.MouseUp).toEqual("mouseup");
    });

    test("check event token mouse move", () => {
        expect(EventRegistrationToken.MouseMove).toEqual("mousemove");
    });

    test("check event token key up", () => {
        expect(EventRegistrationToken.KeyUp).toEqual("keyup");
    });

    test("check event token key down", () => {
        expect(EventRegistrationToken.KeyDown).toEqual("keydown");
    });

    test("check event token change", () => {
        expect(EventRegistrationToken.Change).toEqual("change");
    });

    test("check event token click", () => {
        expect(EventRegistrationToken.Click).toEqual("click");
    });

    test("check event token scroll", () => {
        expect(EventRegistrationToken.Scroll).toEqual("scroll");
    });

    test("check event token input", () => {
        expect(EventRegistrationToken.Input).toEqual("input");
    });
});

describe("checking is widget functions", () => {
    test("test isButton OK", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isButton(elt1)).toBeTruthy();
    });
    test("test isButton KO", () => {
        document.documentElement.innerHTML = "<html><div><input id='cb' type='checkbox'/></div></html>";
        const elt1 = document.getElementById("cb") as Element;
        expect(isButton(elt1)).toBeFalsy();
    });

    test("test isCheckBox OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='cb' type='checkbox'/></div></html>";
        const elt1 = document.getElementById("cb") as Element;
        expect(isCheckBox(elt1)).toBeTruthy();
    });

    test("test isCheckBox KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isCheckBox(elt1)).toBeFalsy();
    });

    test("test isColorChoice KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isColorChoice(elt1)).toBeFalsy();
    });

    test("test isColorChoice OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='col1' type='color'/></div></html>";
        const elt1 = document.getElementById("col1") as Element;
        expect(isColorChoice(elt1)).toBeTruthy();
    });

    test("test isComboBox KO", () => {
        document.documentElement.innerHTML = "<html><div><input id='comb1' list='test'><datalist id='test'>" +
        "<option value='test1'>Test1</option> </datalist></input></div></html>";
        const elt1 = document.getElementById("comb1") as Element;
        expect(isComboBox(elt1)).toBeFalsy();
    });

    test("test isComboBox OK", () => {
        document.documentElement.innerHTML = "<html><div><select id='id'><option value='v1'>Volvo</option></select>/div></html>";
        const elt1 = document.getElementById("id") as Element;
        expect(isComboBox(elt1)).toBeTruthy();
    });

    test("test isDatePicker KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isDatePicker(elt1)).toBeFalsy();
    });

    test("test isDatePicker OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='dt1' type='date' /></div></html>";
        const elt1 = document.getElementById("dt1") as Element;
        expect(isDatePicker(elt1)).toBeTruthy();
    });

    test("test isSpinner KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isSpinner(elt1)).toBeFalsy();
    });

    test("test isSpinner OK", () => {
        document.documentElement.innerHTML = "<html><div><input id='sp1' type='number'></div></html>";
        const elt1 = document.getElementById("sp1") as Element;
        expect(isSpinner(elt1)).toBeTruthy();
    });

    test("test isHyperLink KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isHyperLink(elt1)).toBeFalsy();
    });

    test("test isHyperLink OK", () => {
        document.documentElement.innerHTML = "<html><div><a id='url1' href=''>Test</a></div></html>";
        const elt1 = document.getElementById("url1") as Element;
        expect(isHyperLink(elt1)).toBeTruthy();
    });

    test("test isTextInput KO", () => {
        document.documentElement.innerHTML = "<html><div><button id='b'>A Button</button></div></html>";
        const elt1 = document.getElementById("b") as Element;
        expect(isTextInput(elt1)).toBeFalsy();
    });

    test("test isTextInput OK input", () => {
        document.documentElement.innerHTML = "<html><div><input id='txt' type='text'/></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isTextInput(elt1)).toBeTruthy();
    });

    test("test isTextInput OK textarea", () => {
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isTextInput(elt1)).toBeTruthy();
    });
});

describe("checking event functions", () => {
    test("test isKeyDownEvent KO", () => {
        expect(isKeyDownEvent(createKeyEvent(EventRegistrationToken.KeyUp, "a"))).toBeFalsy();
    });

    test("test isKeyDownEvent OK", () => {
        expect(isKeyDownEvent(createKeyEvent(EventRegistrationToken.KeyDown, "a"))).toBeTruthy();
    });


    test("test isKeyUpEvent KO", () => {
        expect(isKeyUpEvent(createKeyEvent(EventRegistrationToken.KeyDown, "b"))).toBeFalsy();
    });

    test("test isKeyUpEvent OK", () => {
        expect(isKeyUpEvent(createKeyEvent(EventRegistrationToken.KeyUp, "b"))).toBeTruthy();
    });

    test("test isMouseDownEvent KO", () => {
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isMouseDownEvent(createMouseEvent(EventRegistrationToken.MouseUp, elt1))).toBeFalsy();
    });

    test("test isMouseDownEvent OK", () => {
        document.documentElement.innerHTML = "<html><div><textarea id='txt' /></div></html>";
        const elt1 = document.getElementById("txt") as Element;
        expect(isMouseDownEvent(createMouseEvent(EventRegistrationToken.MouseDown, elt1))).toBeTruthy();
    });

    test("test isScrollEvent KO", () => {
        expect(isScrollEvent(createUIEvent(EventRegistrationToken.MouseUp))).toBeFalsy();
    });

    test("test isScrollEvent OK", () => {
        expect(isScrollEvent(createUIEvent(EventRegistrationToken.Scroll))).toBeTruthy();
    });
});

describe("test key codes", () => {
    test("test ESCAPE", () => {
        expect(KeyCode.ESCAPE).toEqual(27);
    });
});
