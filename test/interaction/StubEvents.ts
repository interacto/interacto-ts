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

import type {EventType} from "../../src/api/fsm/EventType";
import type {PointData} from "../../src/api/interaction/PointData";
import type {WheelData} from "../../src/api/interaction/WheelData";
import type {NonoRobot} from "interacto-nono";
import {NonoRobotImpl} from "interacto-nono";

export interface JestNonoRobot {
    runOnlyPendingTimers(): this;

    runAllTimers(): this;
}

class JestNonoRobotImpl extends NonoRobotImpl implements JestNonoRobot {
    public constructor(target?: EventTarget) {
        super(target);
    }

    public runOnlyPendingTimers(): this {
        jest.runOnlyPendingTimers();
        return this;
    }

    public runAllTimers(): this {
        jest.runAllTimers();
        return this;
    }
}

export function robot(target?: EventTarget): JestNonoRobot & NonoRobot {
    return new JestNonoRobotImpl(target);
}

export interface MouseEventForTest extends MouseEvent {
    id: number;
}

export function createTouchEvent(type: "touchend" | "touchmove" | "touchstart", id: number, target: EventTarget,
                                 screenX?: number, screenY?: number,
                                 clientX?: number, clientY?: number, timeStamp?: number): TouchEvent {
    const screenXvalue = screenX ?? 0;
    const screenYvalue = screenY ?? 0;
    const clientXvalue = clientX ?? 0;
    const clientYvalue = clientY ?? 0;
    const evt = new TouchEvent(type, {
        "view": window,
        "bubbles": true,
        "cancelable": false,
        "detail": 1,
        "ctrlKey": false,
        "altKey": false,
        "shiftKey": false,
        "metaKey": false,
        "changedTouches": [
            {
                "identifier": id,
                "screenX": screenXvalue,
                "screenY": screenYvalue,
                "clientX": clientXvalue,
                "clientY": clientYvalue,
                "force": 0,
                "pageX": 0,
                "pageY": 0,
                "radiusX": 0,
                "radiusY": 0,
                "rotationAngle": 0,
                target
            }
        ]
    });

    if (timeStamp !== undefined) {
        Object.defineProperty(evt, "timeStamp", {"value": timeStamp});
    }

    return evt;
}

export function createMouseEvent2(type: "auxclick" | "click" | "mousedown" | "mousemove" | "mouseout" | "mouseover" | "mouseup",
                                  data: Partial<PointData>): MouseEvent {
    const evt = new MouseEvent(type, data);

    Object.defineProperty(evt, "offsetX", {"value": data.offsetX});
    Object.defineProperty(evt, "offsetY", {"value": data.offsetY});
    Object.defineProperty(evt, "screenX", {"value": data.screenX});
    Object.defineProperty(evt, "screenY", {"value": data.screenY});
    Object.defineProperty(evt, "movementX", {"value": data.movementX});
    Object.defineProperty(evt, "movementY", {"value": data.movementY});
    Object.defineProperty(evt, "target", {"value": data.target});
    Object.defineProperty(evt, "currentTarget", {"value": data.currentTarget});
    Object.defineProperty(evt, "pageX", {"value": data.pageX});
    Object.defineProperty(evt, "pageY", {"value": data.pageY});

    if (data.timeStamp !== undefined) {
        Object.defineProperty(evt, "timeStamp", {"value": data.timeStamp});
    }

    return evt;
}

export function createWheelEvent2(type: "wheel",
                                  data: Partial<WheelData>): WheelEvent {
    const evt = new WheelEvent(type, data);

    Object.defineProperty(evt, "offsetX", {"value": data.offsetX});
    Object.defineProperty(evt, "offsetY", {"value": data.offsetY});
    Object.defineProperty(evt, "screenX", {"value": data.screenX});
    Object.defineProperty(evt, "screenY", {"value": data.screenY});
    Object.defineProperty(evt, "movementX", {"value": data.movementX});
    Object.defineProperty(evt, "movementY", {"value": data.movementY});
    Object.defineProperty(evt, "target", {"value": data.target});
    Object.defineProperty(evt, "currentTarget", {"value": data.currentTarget});
    Object.defineProperty(evt, "pageX", {"value": data.pageX});
    Object.defineProperty(evt, "pageY", {"value": data.pageY});
    Object.defineProperty(evt, "deltaX", {"value": data.deltaX});
    Object.defineProperty(evt, "deltaY", {"value": data.deltaY});
    Object.defineProperty(evt, "deltaZ", {"value": data.deltaZ});
    Object.defineProperty(evt, "deltaMode", {"value": data.deltaMode});

    if (data.timeStamp !== undefined) {
        Object.defineProperty(evt, "timeStamp", {"value": data.timeStamp});
    }

    return evt;
}

export function createMouseEvent(type: "auxclick" | "click" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" |
"mouseout" | "mouseover" | "mouseup",
                                 target: EventTarget, screenX?: number, screenY?: number, clientX?: number,
                                 clientY?: number, buttonValue = 0): MouseEvent {
    const screenXvalue = screenX ?? 0;
    const screenYvalue = screenY ?? 0;
    const clientXvalue = clientX ?? 0;
    const clientYvalue = clientY ?? 0;
    return new MouseEvent(type, {
        "view": window,
        "bubbles": true,
        "cancelable": false,
        "detail": 1,
        "screenX": screenXvalue,
        "screenY": screenYvalue,
        "clientX": clientXvalue,
        "clientY": clientYvalue,
        "ctrlKey": false,
        "altKey": false,
        "shiftKey": false,
        "metaKey": false,
        "button": buttonValue,
        "relatedTarget": target
    });
}

export function createWheelEvent(type: "wheel",
                                 target: EventTarget, screenX?: number, screenY?: number, clientX?: number,
                                 clientY?: number, button?: number, deltaX?: number, deltaY?: number,
                                 deltaZ?: number, deltaModeValue = 0): WheelEvent {
    const screenXvalue = screenX ?? 0;
    const screenYvalue = screenY ?? 0;
    const clientXvalue = clientX ?? 0;
    const clientYvalue = clientY ?? 0;
    const buttonValue = button ?? 0;
    const deltaXValue = deltaX ?? 0;
    const deltaYValue = deltaY ?? 0;
    const deltaZValue = deltaZ ?? 0;
    return new WheelEvent(type, {
        "view": window,
        "bubbles": true,
        "cancelable": false,
        "detail": 1,
        "screenX": screenXvalue,
        "screenY": screenYvalue,
        "clientX": clientXvalue,
        "clientY": clientYvalue,
        "ctrlKey": false,
        "altKey": false,
        "shiftKey": false,
        "metaKey": false,
        "button": buttonValue,
        "relatedTarget": target,
        "deltaX": deltaXValue,
        "deltaY": deltaYValue,
        "deltaZ": deltaZValue,
        "deltaMode": deltaModeValue
    });
}

export function createKeyEvent(type: "keydown" | "keyup", key = "", code = ""): KeyboardEvent {
    return new KeyboardEvent(type, {
        "cancelable": false,
        "bubbles": true,
        "view": window,
        code,
        key,
        "repeat": false
    });
}

export function createUIEvent(type: EventType): UIEvent {
    return new UIEvent(type, {
        "detail": 0,
        "bubbles": true,
        "cancelable": false,
        "view": window
    });
}

export function createEventWithTarget(target: EventTarget | null, type: string): Event {
    return {"currentTarget": target,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "AT_TARGET": 2,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "BUBBLING_PHASE": 3,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "CAPTURING_PHASE": 1,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "NONE": 0,
        "composedPath": (): Array<EventTarget> => [],
        "initEvent": (_type: string, _bubbles: boolean | undefined, _cancelable: boolean | undefined): void => {},
        "preventDefault": (): void => {},
        "stopImmediatePropagation": (): void => {},
        "stopPropagation": (): void => {},
        "bubbles": false,
        "cancelBubble": false,
        "cancelable": false,
        "composed": false,
        "defaultPrevented": false,
        "eventPhase": 0,
        "isTrusted": false,
        "returnValue": false,
        // eslint-disable-next-line unicorn/no-null
        "srcElement": null,
        "timeStamp": 0,
        type,
        target};
}
