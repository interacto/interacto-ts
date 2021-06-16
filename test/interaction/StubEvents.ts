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


export interface MouseEventForTest extends MouseEvent {
    id: number;
}

export interface EventTargetInit {
    target?: EventTarget;
}

export interface NonoRobot {
    mousedown(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    click(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    dblclick(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    auxclick(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    mousemove(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    mouseup(params?: EventTarget | (EventTargetInit & MouseEventInit)): this;
    input(params?: EventTarget | (EventTargetInit & InputEventInit)): this;
    change(params?: EventTarget | (EventTargetInit & InputEventInit)): this;
    keydown(params?: EventTarget | (EventTargetInit & KeyboardEventInit)): this;
    keyup(params?: EventTarget | (EventTargetInit & KeyboardEventInit)): this;
    scroll(params?: EventTarget | (EventTargetInit & UIEventInit)): this;
    touchstart(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this;
    touchmove(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this;
    touchend(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this;
    do(fn: () => void): this;
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


export function createMouseEvent2(type: "auxclick" | "click" | "mousedown" | "mousemove" | "mouseup",
                                  data: Partial<PointData>): MouseEvent {
    const evt = new MouseEvent("click", data);

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


export function createMouseEvent(type: "auxclick" | "click" | "mousedown" | "mousemove" | "mouseout" | "mouseover" | "mouseup",
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

class NonoRobotImpl implements NonoRobot {
    private currentTarget: EventTarget | undefined;

    public constructor(target?: EventTarget) {
        this.currentTarget = target;
    }

    private checkEventTarget(target?: EventTarget | EventTargetInit): EventTarget {
        let evtTarget: EventTarget | undefined;

        if (target instanceof EventTarget) {
            evtTarget = target;
        } else {
            if (target?.target !== undefined) {
                evtTarget = target.target;
            }
        }

        if (this.currentTarget === undefined && evtTarget === undefined) {
            throw new Error("You must specify the event target");
        }
        if (evtTarget !== undefined) {
            this.currentTarget = evtTarget;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.currentTarget!;
    }

    private fixingParameters<T extends EventInit>(params: EventTarget | T): T {
        const parameters: T = params instanceof EventTarget ? {} as T : {...params};
        // Requires for bubbling
        parameters.bubbles ??= true;
        return parameters;

    }

    private processMouseEvent(type: "auxclick" | "click" | "dblclick" | "mousedown" | "mousemove" | "mouseup",
                              params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        this.checkEventTarget(params).dispatchEvent(new MouseEvent(type, this.fixingParameters(params ?? {})));
        return this;
    }

    private processKeyEvent(type: "keydown" | "keyup", params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        this.checkEventTarget(params).dispatchEvent(new KeyboardEvent(type, this.fixingParameters(params ?? {})));
        return this;
    }

    private processTouchEvent(type: "touchend" | "touchmove" | "touchstart",
                              params?: EventTarget | (EventTargetInit & TouchEventInit), touchInits?: Array<TouchInit>,
                              timestamp?: number): this {
        const paramsToUse = this.fixingParameters(params ?? {});
        if (touchInits !== undefined && touchInits.length > 0) {
            // eslint-disable-next-line complexity
            const touches: Array<Touch> = touchInits.map(init => ({
                "altitudeAngle": init.altitudeAngle ?? 0,
                "azimuthAngle": init.azimuthAngle ?? 0,
                "identifier": init.identifier,
                "screenX": init.screenX ?? 0,
                "screenY": init.screenY ?? 0,
                "clientX": init.clientX ?? 0,
                "clientY": init.clientY ?? 0,
                "force": init.force ?? 0,
                "pageX": init.pageX ?? 0,
                "pageY": init.pageY ?? 0,
                "radiusX": init.radiusX ?? 0,
                "radiusY": init.radiusY ?? 0,
                "rotationAngle": init.rotationAngle ?? 0,
                "target": this.checkEventTarget(params),
                "touchType": init.touchType ?? "direct"
            } as Touch));
            if (paramsToUse.changedTouches === undefined) {
                paramsToUse.changedTouches = touches;
            } else {
                paramsToUse.changedTouches.push(...touches);
            }
        }

        const evt = new TouchEvent(type, paramsToUse);

        if (timestamp !== undefined) {
            Object.defineProperty(evt, "timeStamp", {"value": timestamp});
        }

        this.checkEventTarget(params).dispatchEvent(evt);
        return this;
    }

    public click(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("click", params);
    }

    public dblclick(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("dblclick", params);
    }

    public auxclick(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("auxclick", params);
    }

    public mousemove(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("mousemove", params);
    }

    public mousedown(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("mousedown", params);
    }

    public mouseup(params?: EventTarget | (EventTargetInit & MouseEventInit)): this {
        return this.processMouseEvent("mouseup", params);
    }

    public scroll(params?: EventTarget | (EventTargetInit & UIEventInit)): this {
        this.checkEventTarget(params).dispatchEvent(new UIEvent("scroll", this.fixingParameters(params ?? {})));
        return this;
    }

    public input(params?: EventTarget | (EventTargetInit & InputEventInit)): this {
        this.checkEventTarget(params).dispatchEvent(new InputEvent("input", this.fixingParameters(params ?? {})));
        return this;
    }

    public change(params?: EventTarget | (EventTargetInit & InputEventInit)): this {
        this.checkEventTarget(params).dispatchEvent(new Event("change", this.fixingParameters(params ?? {})));
        return this;
    }

    public keydown(params?: EventTarget | (EventTargetInit & KeyboardEventInit)): this {
        return this.processKeyEvent("keydown", params);
    }

    public keyup(params?: EventTarget | (EventTargetInit & KeyboardEventInit)): this {
        return this.processKeyEvent("keyup", params);
    }

    public touchstart(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this {
        return this.processTouchEvent("touchstart", params, touches, timestamp);
    }

    public touchmove(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this {
        return this.processTouchEvent("touchmove", params, touches, timestamp);
    }

    public touchend(params?: EventTarget | (EventTargetInit & TouchEventInit), touches?: Array<TouchInit>, timestamp?: number): this {
        return this.processTouchEvent("touchend", params, touches, timestamp);
    }

    public do(fn: () => void): this {
        fn();
        return this;
    }
}

export function robot(target?: EventTarget): NonoRobot {
    return new NonoRobotImpl(target);
}
