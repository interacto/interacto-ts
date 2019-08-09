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

import {KeyData} from "./KeyData";
import {FSM} from "../../src-core/fsm/FSM";
import {TSInteraction} from "../TSInteraction";
import {Optional} from "../../util/Optional";
import {KeyDataImpl} from "./KeyDataImpl";

export abstract class KeyInteraction<D extends KeyData, F extends FSM<Event>, T> extends TSInteraction<D, F, T> implements KeyData {
    public readonly keyData: KeyDataImpl;

    protected constructor(fsm: F) {
        super(fsm);
        this.keyData = new KeyDataImpl();
    }

    public reinitData(): void {
        super.reinitData();
        this.keyData.reinitData();
    }

    public setKeyData(event: KeyboardEvent): void {
        this.keyData.setKeyData(event);
    }

    public getKey(): String {
        return this.keyData.getKey();
    }

    public getTarget(): Optional<EventTarget> {
        return this.keyData.getTarget();
    }
}

