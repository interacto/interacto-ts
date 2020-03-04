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

import { WidgetTransition, StdState, FSM } from "../../src";
import { StubEvent } from "./StubEvent";

class WTransition extends WidgetTransition<StubEvent, Object> {
    public constructor() {
        super(new StdState(new FSM(), "a"), new StdState(new FSM(), "b"));
    }

    public accept(event: StubEvent): boolean {
        return false;
    }
    public isGuardOK(event: StubEvent): boolean {
        return false;
    }
    public getAcceptedEvents(): Set<string> {
        return new Set();
    }
}

let transition: WTransition;

beforeEach(() => {
    transition = new WTransition();
});

test("testSetWidget", () => {
    const o = new Object();
    transition.setWidget(o);
    expect(transition.getWidget()).toEqual(o);
});
