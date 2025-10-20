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
import {isUndoableType} from "../undo/Undoable";


const INTERACTO_MODIFIABLE: unique symbol = Symbol('interacto-cmd-modifiable');

/**
 * The Interacto decorator to mark command's properties as modifiable after being executed.
 * Cannot check the type of the property here (requires reflect-metadata we do not want to install).
 * @param target The targeted command.
 * @param propertyName The name of the property the decorator targets.
 */
export function Modifiable(target: unknown, propertyName: string): void {
    if(!isUndoableType(target)) {
        console.log("The @Modifiable decorator currently operates on Interacto undoable commands only")
        return;
    }

    //Getting the object cache related to the modifiable symbol
    const symbolValues: unknown = target.constructor[INTERACTO_MODIFIABLE];
    const set = symbolValues instanceof Set ? symbolValues as Set<string> : new Set<string>();

    // Adding the property in this cache
    set.add(propertyName);
    target.constructor[INTERACTO_MODIFIABLE] = set;
}

export function isCmdModifiable(obj: unknown, key: string): boolean {
    const modifiables: unknown = obj.constructor[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set) {
        return modifiables.has(key);
    }
    return false;
}

export function modifyCmdAttributes(obj: unknown, attributes: { [key: string]: unknown }): void {
    Object.keys(attributes).forEach(key => {
        if (isCmdModifiable(obj, key)) {
            const value: unknown = attributes[key];
            const type = typeof obj[key];
            const typeValue = typeof value;
            if (typeValue === type && typeValue) {
                obj[key] = value;
            } else {
                console.error("Incorrect type");
            }
        } else {
            console.error("Incorrect property");
        }
    });
}

/**
 * Returns the set of modifiable (i.e., properties with the Interacto decorator Modifiable) properties of the given object.
 * @param obj The object to analyze.
 */
export function getModifiableCmdAttributes(obj: unknown): Map<string, unknown> {
    const modifiableAttributes = new Map<string, unknown>();
    const modifiables: unknown = obj.constructor[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set && obj instanceof Object) {
        modifiables.forEach((key: unknown) => {
            if (typeof key === "string" && key in obj) {
                const type = typeof obj[key];
                if (type === "string" || type === "number" || type === "boolean") {
                    modifiableAttributes.set(key, obj[key]);
                } else {
                    console.error(type, "Cannot modify a property that is not a string, number, or boolean");
                }
            }
        });
    }
    return modifiableAttributes;
}
