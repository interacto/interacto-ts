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
import { LogLevel } from "../../logging/LogLevel";

export interface BaseBinderBuilder<W> {
	on(...widgets: Array<W>): BaseBinderBuilder<W>;

	/**
	 * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
	 * @param whenPredicate The predicate that checks whether the command can be initialised, updated, or executed.
	 * @return The builder to chain the building configuration.
	 */
    when(whenPredicate: () => boolean): BaseBinderBuilder<W>;

    end(endFct: () => void): BaseBinderBuilder<W>;

	/**
	 * Specifies the loggings to use.
	 * Several call to 'log' can be done to log different parts:
	 * log(LogLevel.INTERACTION).log(LogLevel.COMMAND)
	 * @param level The logging level to use.
	 * @return The builder to chain the building configuration.
	 */
    log(...level: Array<LogLevel>): BaseBinderBuilder<W>;

	// /**
	//  * Specifies that the command will be executed in a separated threads.
	//  * Beware of UI modifications: UI changes must be done in the JFX UI thread.
	//  * @return The builder to chain the building configuration.
	//  */
    // async(): BaseBinderBuilder<W>;

	// /**
	//  * Uses the default help animation of the user interaction to explain how the binding works.
	//  * @param helpPane The pane where the animation will be played.
	//  * @return The builder to chain the building configuration.
	//  */
    // help(): BaseBinderBuilder<W>;
}
