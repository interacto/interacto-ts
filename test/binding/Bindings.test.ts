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

import { anonCmdBinder, buttonBinder, dndBinder, dragLockBinder, nodeBinder } from "../../src/binding/Bindings";
import { Click } from "../../src/interaction/library/Click";
import { StubCmd } from "../command/StubCmd";
import { AnonCmd, DoubleClick, EventRegistrationToken, LogLevel, MArray } from "../../src";
import { createMouseEvent } from "../interaction/StubEvents";

jest.mock("../command/StubCmd");

let button: HTMLElement;
let canvas: HTMLElement;

beforeEach(() => {
    jest.clearAllMocks();
    document.documentElement.innerHTML = "<html><div><canvas id='canvas1' /><button id='b1'>A Button</button></div></html>";
    const elt1 = document.getElementById("b1");
    if (elt1 !== null) {
        button = elt1;
    }
    const elt2 = document.getElementById("canvas1");
    if (elt2 !== null) {
        canvas = elt2;
    }
});

test("button binder ok", () => {
    buttonBinder(() => new StubCmd()).on(button).bind();
    button.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("node binder ok", () => {
    nodeBinder(new Click(), () => new StubCmd()).on(canvas).bind();
    canvas.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Anon cmd binder ok", () => {
    const cmd = new StubCmd();
    anonCmdBinder(new Click(), () => cmd.doIt()).on(canvas).bind();
    canvas.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("node binder on multiple target", () => {
    const target = new MArray<EventTarget>();
    target.push(canvas, button);
    nodeBinder(new Click(), () => new AnonCmd(() => {
        console.log("Test");
    })).on(target).bind();
    // canvas.click();
    button.click();
});

test("dndBinder with to() routine", () => {
    dndBinder(() => new StubCmd(), false, false).on(button).to(canvas).bind();
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, button));
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, button));
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseUp, button));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseUp, canvas));
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Check if interaction successfully update on 'to' widget unless the interaction is in this InitState", () => {
    dndBinder(() => new StubCmd(), false, false).on(button).to(canvas).bind();
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, button));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseUp, canvas));
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, canvas));
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, button));
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseUp, button));
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Check DragLockBinder", () => {
    dragLockBinder(() => new StubCmd()).on(canvas).bind();
    canvas.click();
    canvas.click();
    canvas.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, canvas));
    canvas.click();
    canvas.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Test the end() routine", () => {
    buttonBinder(i => new StubCmd()).on(button).end(i => expect(i.getWidget()).not.toBe(undefined)).bind();
    button.click();
    expect(StubCmd.prototype.doIt).toHaveBeenCalledTimes(1);
});

test("Test cancel log message", () => {
    nodeBinder(new DoubleClick(), () => new StubCmd()).on(button).log(LogLevel.BINDING).bind();
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseDown, button));
    button.dispatchEvent(createMouseEvent(EventRegistrationToken.MouseMove, button));
    expect(StubCmd.prototype.doIt).not.toHaveBeenCalled();
});
