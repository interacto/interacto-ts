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

/**
 * Removes the given element from the array.
 * @param array - The array to mutate.
 * @param elt - The element to remove.
 * @category Helper
 */
export function remove<T>(array: Array<T>, elt: T): void {
    const index = array.indexOf(elt);
    if (index > -1) {
        array.splice(index, 1);
    }
}

/**
 * Removes the element at the given position.
 * @param array - The array to mutate.
 * @param index - The index where to remove
 * @returns The removed element or nothing.
 * @category Helper
 */
export function removeAt<T>(array: Array<T>, index: number): T | undefined {
    if (index > -1) {
        return array.splice(index, 1)[0];
    }
    return undefined;
}
