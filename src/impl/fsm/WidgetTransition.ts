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

import {TransitionBase} from "./TransitionBase";
import type {OutputState} from "../../api/fsm/OutputState";
import type {InputState} from "../../api/fsm/InputState";

/**
 * This transition must be used to use a widget within an interaction.
 */
export abstract class WidgetTransition<T> extends TransitionBase<Event> {
    /**
     * The pressed button.
     */
    protected widget: T;

    /**
     * Creates the widget transition.
     * @param srcState - The source state of the transition.
     * @param tgtState - The output state of the transition.
     */
    protected constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    /**
     * @returns The widget used.
     */
    public getWidget(): T {
        return this.widget;
    }

    /**
     * Sets the widget.
     * @param widget - The widget to set. Nothing done if null.
     */
    public setWidget(widget: T): void {
        this.widget = widget;
    }
}
