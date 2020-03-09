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


import { CommandImpl } from "../CommandImpl";

/**
 * Creates the command.
 * @class
 * @extends CommandImpl
 * @author Arnaud BLOUIN
 */
export abstract class PositionCommand extends CommandImpl {
    /**
     * The X-coordinate of the location to zoom.
     */
    protected px: number;

    /**
     * The Y-coordinate of the location to zoom.
     */
    protected py: number;

    protected constructor() {
        super();
        this.px = NaN;
        this.py = NaN;
    }

    /**
     * @param {number} px The x-coordinate to set.
     * @since 0.2
     */
    public setPx(px: number): void {
        this.px = px;
    }

    /**
     * @param {number} py The y-coordinate to set.
     * @since 0.2
     */
    public setPy(py: number): void {
        this.py = py;
    }
}
