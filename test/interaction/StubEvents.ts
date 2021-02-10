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

import {EventType} from "../../src/api/fsm/EventType";


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
                "altitudeAngle": 0,
                "azimuthAngle": 0,
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
                target,
                "touchType": "direct"
            }
        ]
    });

    if (timeStamp !== undefined) {
        Object.defineProperty(evt, "timeStamp", {"value": timeStamp});
    }

    return evt;
}


export function createMouseEvent(type: "auxclick" | "click" | "mousedown" | "mousemove" | "mouseup",
                                 target: EventTarget, screenX?: number, screenY?: number, clientX?: number,
                                 clientY?: number, button?: number): MouseEvent {
    const screenXvalue = screenX ?? 0;
    const screenYvalue = screenY ?? 0;
    const clientXvalue = clientX ?? 0;
    const clientYvalue = clientY ?? 0;
    const buttonValue = button ?? 0;
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

export function createKeyEvent(type: "keydown" | "keyup", keyCode: string): KeyboardEvent {
    return new KeyboardEvent(type, {
        "cancelable": false,
        "bubbles": true,
        "view": window,
        "code": keyCode,
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
    return {"currentTarget": null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "AT_TARGET": 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "BUBBLING_PHASE": 0,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "CAPTURING_PHASE": 0,
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
        "srcElement": null,
        "timeStamp": 0,
        type,
        target};
}
