/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */
import {isUndoableType} from "../history/Undoable";
import type {Command} from "./Command";
import type {Undoable} from "../history/Undoable";

const INTERACTO_MODIFIABLE: unique symbol = Symbol("interacto-cmd-modifiable");

interface ModifiableMetadata {
    [INTERACTO_MODIFIABLE]?: Set<string>;
}

/**
 * The Interacto decorator to mark command's properties as modifiable after being executed.
 * Cannot check the type of the property here (requires reflect-metadata we do not want to install).
 * @param target - The targeted command.
 * @param propertyName - The name of the property the decorator targets.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Modifiable(target: unknown, propertyName: string): void {
    if (!isUndoableType(target)) {
        // eslint-disable-next-line no-console
        console.error("The @Modifiable decorator currently operates on Interacto undoable commands only");
        return;
    }

    // Getting the object cache related to the modifiable symbol
    const symbolValues: unknown = (target.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];
    const set = symbolValues instanceof Set ? symbolValues as Set<string> : new Set<string>();

    // Adding the property in this cache
    set.add(propertyName);
    (target.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE] = set;
}

/**
 * Checks whether the given object and its given property are modifiable
 * @param obj - The command to modify
 * @param key - The property of the command to modify
 * @returns True if the property of the command can be modified.
 */
export function isCmdModifiable(obj: Undoable, key: string): boolean {
    const modifiables: unknown = (obj.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set) {
        return modifiables.has(key);
    }
    return false;
}

/**
 * Modifies attributes of the given undoable command based on a given source partial object.
 * @param obj - The command to modify
 * @param attributes - The set of properties of the command to modify
 * @returns True if the undoable command has been modified.
 * False otherwise, for example, if no attribute has been modified (e.g., no corresponding attribute or
 * all the source and target attributes are equal).
 */
export function modifyCmdAttributes<T extends Command & Undoable>(obj: T, attributes: Partial<T>): boolean {
    let hasChanged = false;

    for (const key of Object.keys(attributes)) {
        if (isCmdModifiable(obj, key)) {
            const tkey = key as keyof T;
            const value = attributes[tkey];
            if (typeof value === typeof obj[tkey]) {
                if (value !== obj[tkey]) {
                    obj[tkey] = value as T[keyof T];
                    hasChanged = true;
                }
            } else {
                // eslint-disable-next-line no-console
                console.error("Trying to affect a value of an incorrect type to a parameter of a command");
            }
        } else {
            // eslint-disable-next-line no-console
            console.error("Trying to affect a value of an incorrect parameter of a command");
        }
    }
    return hasChanged;
}

/**
 * Retrieves the subset of attributes from an {@link Undoable} instance that are
 * considered modifiable (i.e., annotated with `@Modifiable`)
 * (only primitive types considered for the moment: string, number, or boolean).
 * @param obj - The object from which to extract modifiable attributes.
 * @returns Partial<T> - An object (extracted from `obj`) containing only the properties that are
 * declared as modifiable.
 */
export function getModifiableCmdAttributes<T extends Undoable>(obj: T): Partial<T> {
    const modifiableAttributes: Partial<T> = {};
    const modifiables: unknown = (obj.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set) {
        for (const key of modifiables) {
            const tkey = key as keyof T;
            const type = typeof obj[tkey];

            if (type === "string" || type === "number" || type === "boolean" || type === "bigint") {
                modifiableAttributes[tkey] = obj[tkey];
            } else {
                // eslint-disable-next-line no-console
                console.error(type, "Cannot modify a property that is not a string, number, or boolean");
            }
        }
    }
    return modifiableAttributes;
}
