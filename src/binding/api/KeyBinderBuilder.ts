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

export interface KeyBinderBuilder {
    /**
	 * Defines key code the widget binding will check. On a key interaction, the typed keys will be check against
	 * the given key code. The set of typed codes must matches the given key codes.
	 * @param codes The key codes to match.
	 * @return The builder.
	 */
    with(...codes: Array<string>): KeyBinderBuilder;
}
