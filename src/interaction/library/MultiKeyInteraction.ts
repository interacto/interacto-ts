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

import { FSM } from "../../fsm/FSM";
import { Optional } from "../../util/Optional";
import { KeysData } from "./KeysData";
import { KeysDataImpl } from "./KeysDataImpl";
import { InteractionImpl } from "../InteractionImpl";

export abstract class MultiKeyInteraction<D extends KeysData, F extends FSM> extends InteractionImpl<D, F, Event>
    implements KeysData {
    public readonly keysData: KeysDataImpl;

    protected constructor(fsm: F) {
        super(fsm);
        this.keysData = new KeysDataImpl();
    }

    public reinitData(): void {
        super.reinitData();
        this.keysData.reinitData();
    }

    public setKeysDataTarget(event: KeyboardEvent): void {
        this.keysData.setKeysDataTarget(event);
    }

    public addKeysDataKey(event: KeyboardEvent): void {
        this.keysData.addKeysDataKey(event);
    }

    public removeKeysDataKey(event: KeyboardEvent): void {
        this.keysData.removeKeysDataKey(event);
    }

    public getKeys(): Array<string> {
        return this.keysData.getKeys();
    }

    public getTarget(): Optional<EventTarget> {
        return this.keysData.getTarget();
    }

}
