/*
 * Interacto
 * Copyright (C) 2019 Arnaud Blouin
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import type {FSMImpl} from "../../src/impl/fsm/FSMImpl";
import {StdState} from "../../src/impl/fsm/StdState";
import {WidgetTransition} from "../../src/impl/fsm/WidgetTransition";
import {mock} from "jest-mock-extended";
import type {EventType} from "../../src/api/fsm/EventType";

class WTransition extends WidgetTransition<string> {
    public constructor() {
        super(new StdState(mock<FSMImpl>(), "a"), new StdState(mock<FSMImpl>(), "b"));
    }

    public accept(event: Event): event is Event {
        return false;
    }

    public override isGuardOK(_event: Event): boolean {
        return false;
    }

    public getAcceptedEvents(): Array<EventType> {
        return [];
    }
}

let transition: WTransition;

beforeEach(() => {
    transition = new WTransition();
});

test("set Widget", () => {
    transition.setWidget("foooo");
    expect(transition.getWidget()).toBe("foooo");
});
