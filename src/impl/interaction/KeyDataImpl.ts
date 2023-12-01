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

import type {KeyData} from "../../api/interaction/KeyData";
import type {Flushable} from "./Flushable";
import {InteractionDataBase} from "./InteractionDataBase";

export class KeyDataImpl extends InteractionDataBase implements KeyData, Flushable {
    private codeData = "";

    private keyData = "";

    private locationData = 0;

    private repeatData = false;

    private altKeyData = false;

    private ctrlKeyData = false;

    private metaKeyData = false;

    private shiftKeyData = false;

    public override flush(): void {
        super.flush();
        this.codeData = "";
        this.keyData = "";
        this.locationData = 0;
        this.repeatData = false;
        this.altKeyData = false;
        this.ctrlKeyData = false;
        this.metaKeyData = false;
        this.shiftKeyData = false;
    }

    public override copy(data: KeyData): void {
        super.copy(data);
        /*
         * Cannot use Object.assign because of a strange implementation of Event
         * that prevents accessing the properties
         */
        this.codeData = data.code;
        this.keyData = data.key;
        this.locationData = data.location;
        this.repeatData = data.repeat;
        this.altKeyData = data.altKey;
        this.ctrlKeyData = data.ctrlKey;
        this.metaKeyData = data.metaKey;
        this.shiftKeyData = data.shiftKey;
    }

    public get altKey(): boolean {
        return this.altKeyData;
    }

    public get code(): string {
        return this.codeData;
    }

    public get ctrlKey(): boolean {
        return this.ctrlKeyData;
    }

    public get key(): string {
        return this.keyData;
    }

    public get location(): number {
        return this.locationData;
    }

    public get metaKey(): boolean {
        return this.metaKeyData;
    }

    public get repeat(): boolean {
        return this.repeatData;
    }

    public get shiftKey(): boolean {
        return this.shiftKeyData;
    }
}
