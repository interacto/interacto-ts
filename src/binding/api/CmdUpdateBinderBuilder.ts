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
import { Command } from "../../command/Command";
import { CmdBinderBuilder } from "./CmdBinderBuilder";
import { BaseUpdateBinderBuilder } from "./BaseUpdateBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";

export interface CmdUpdateBinderBuilder<W, C extends Command> extends CmdBinderBuilder<W, C>, BaseUpdateBinderBuilder<W> {
	/**
	 * Specifies the update of the command on interaction updates.
	 * @param update The callback method that updates the command.
	 * This callback takes as arguments the command to update.
	 * @return The builder to chain the building configuration.
	 */
	then(update: (c: C) => void): CmdUpdateBinderBuilder<W, C>;

    continuousExecution(): CmdUpdateBinderBuilder<W, C>;

	strictStart(): CmdUpdateBinderBuilder<W, C>;

    throttle(timeout: number): CmdUpdateBinderBuilder<W, C>;

    first(initCmdFct: (c: C) => void): CmdUpdateBinderBuilder<W, C>;

    on(...widgets: Array<W>): CmdUpdateBinderBuilder<W, C>;

    end(endFct: (c?: C) => void): CmdUpdateBinderBuilder<W, C>;

    when(whenPredicate: () => boolean): CmdUpdateBinderBuilder<W, C>;

    log(...level: Array<LogLevel>): CmdUpdateBinderBuilder<W, C>;

    // async(): CmdUpdateBinderBuilder<W, C> ;

    // help() : CmdUpdateBinderBuilder<W, C>;
}
