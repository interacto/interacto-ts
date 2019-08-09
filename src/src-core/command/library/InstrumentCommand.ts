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

import {Instrument} from "../../instrument/Instrument";
import {WidgetBinding} from "../../binding/WidgetBinding";
import {CommandImpl} from "../CommandImpl";

/**
 * This action manipulates an instrument.
 * @author Arnaud Blouin
 * @param {*} instrument
 * @class
 * @extends CommandImpl
 */
export abstract class InstrumentCommand extends CommandImpl {
    /**
     * The manipulated instrument.
     */
    protected instrument: Instrument<WidgetBinding> | undefined;

    protected constructor(instrument?: Instrument<WidgetBinding>) {
        super();
        this.instrument = instrument;
    }

    /**
     *
     */
    public flush(): void {
        super.flush();
        this.instrument = undefined;
    }

    /**
     *
     * @return {boolean}
     */
    public canDo(): boolean {
        return this.instrument !== undefined;
    }

    /**
     * @return {*} The manipulated instrument.
     */
    public getInstrument(): Instrument<WidgetBinding> | undefined {
        return this.instrument;
    }

    /**
     * Sets the manipulated instrument.
     * @param {*} newInstrument The manipulated instrument.
     */
    public setInstrument(newInstrument: Instrument<WidgetBinding>): void {
        this.instrument = newInstrument;
    }
}
