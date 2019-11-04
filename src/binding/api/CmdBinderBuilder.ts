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
import { BaseBinderBuilder } from "./BaseBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";


export interface CmdBinderBuilder<W, C extends Command> extends BaseBinderBuilder<W> {
	/**
	 * Specifies the initialisation of the command when the interaction starts.
	 * Each time the interaction starts, an instance of the command is created and configured by the given callback.
	 * @param initCmdFct The callback method that initialises the command.
	 * This callback takes as arguments the command to configure.
	 * @return The builder to chain the building configuration.
	 */
	first(initCmdFct: (c: C) => void): CmdBinderBuilder<W, C>;

	end(onEnd: (c?: C) => void): CmdBinderBuilder<W, C>;

	on(...widgets: Array<W>): CmdBinderBuilder<W, C>;

	when(whenPredicate: () => boolean): CmdBinderBuilder<W, C>;

	log(...level: Array<LogLevel>): CmdBinderBuilder<W, C>;

	// async(): CmdBinderBuilder<W, C>;

	// help(): CmdBinderBuilder<W, C>;
}
