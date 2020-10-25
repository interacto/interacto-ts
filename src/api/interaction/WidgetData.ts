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

import {InteractionData} from "./InteractionData";

/**
 * Interaction data that contains a widget.
 * @param <T> The type of the widget.
 */
export interface WidgetData<T> extends InteractionData {
    /**
     * @return The widget used during the interaction.
     */
    getWidget(): T | undefined;
}

export class WidgetDataImpl<T> implements WidgetData<T> {
    private widget?: T;

    public getWidget(): T | undefined {
        return this.widget;
    }

    public setWidget(widget?: T): void {
        this.widget = widget;
    }

    public flush(): void {
        this.widget = undefined;
    }
}
