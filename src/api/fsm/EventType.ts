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

export const mouseEventTypes = [
    "mousedown",
    "mouseup",
    "mousemove",
    "mouseover",
    "mouseout",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "click",
    "auxclick"
] as const;

export const touchEventTypes = [
    "touchstart",
    "touchend",
    "touchmove"
] as const;

export const keyEventTypes = [
    "keydown",
    "keyup"
] as const;

/**
 * The supported event types.
 */
export const eventTypes = [
    ...mouseEventTypes,
    ...touchEventTypes,
    ...keyEventTypes,
    "input",
    "scroll",
    "change",
    "wheel"
] as const;

/**
 * The supported event types as a type
 */
export type EventType = typeof eventTypes[number];

/**
 * The mouse event type
 */
export type MouseEventType = typeof mouseEventTypes[number];

/**
 * The touch event type
 */
export type TouchEventType = typeof touchEventTypes[number];

/**
 * The key event type
 */
export type KeyEventType = typeof keyEventTypes[number];
