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


import {CommandBase} from "./CommandBase";

/**
 * An anonymous command that takes an anonymous function as a parameter corresponding to the command to execute.
 * The goal of this command is to avoid the creation of a command class for a small command.
 * @author Arnaud Blouin
 * @param {() => void} function
 * @class
 * @extends CommandBase
 */
export class AnonCmd extends CommandBase {
    private readonly exec: () => void;

    public constructor(fct: () => void) {
        super();
        this.exec = fct;
    }

    /**
     *
     * @return {boolean}
     */
    public canDo(): boolean {
        return true;
    }

    protected doCmdBody(): void {
        this.exec();
    }
}
