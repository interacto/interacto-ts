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
     * Defines the key values the binding will check. On a key interaction, the pressed keys will be checked against
     * the given key values. The set of pressed keys must match the given key values.
     * @param isCode - If true, key codes will be used instead of key values. Keep in mind that key codes ignore the user's keyboard layout.
     * See {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code}.
     * @param keysOrCodes - The key values to match, or key codes if isCode is set to true.
     * @returns A clone of the current builder to chain the building configuration.
     */
    with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeyBinderBuilder;
}
