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
import {CommandBase} from "../../impl/command/CommandBase";

const INTERACTO_MODIFIABLE: unique symbol = Symbol('interacto-cmd-modifiable');

interface ModifiableMetadata {
    [INTERACTO_MODIFIABLE]?: Set<string>;
}

/**
 * The Interacto decorator to mark command's properties as modifiable after being executed.
 * Cannot check the type of the property here (requires reflect-metadata we do not want to install).
 * @param target The targeted command.
 * @param propertyName The name of the property the decorator targets.
 */
export function Modifiable(target: unknown, propertyName: string): void {
    if (!isUndoableType(target)) {
        console.log("The @Modifiable decorator currently operates on Interacto undoable commands only")
        return;
    }

    //Getting the object cache related to the modifiable symbol
    const symbolValues: unknown = (target.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];
    const set = symbolValues instanceof Set ? symbolValues as Set<string> : new Set<string>();

    // Adding the property in this cache
    set.add(propertyName);
    (target.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE] = set;
}

export function isCmdModifiable(obj: CommandBase, key: string): boolean {
    const modifiables: unknown = (obj.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set) {
        return modifiables.has(key);
    }
    return false;
}

export function modifyCmdAttributes<T>(obj: T, attributes: Partial<T>): void {
    if (!(obj instanceof CommandBase) || !obj.isDone()) {
        console.log("Only already executed and done Interacto commands can be modified");
        return;
    }

    Object.keys(attributes).forEach(key => {
        if (isCmdModifiable(obj, key)) {
            const k = key as keyof T;
            const value = attributes[k];
            if (value && typeof value === typeof obj[k]) {
                obj[k] = value as (T & CommandBase)[keyof T];
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
export function getModifiableCmdAttributes<T>(obj: T & Object): Partial<T> {
    const modifiableAttributes: Partial<T> = {};
    const modifiables: unknown = (obj.constructor as ModifiableMetadata)[INTERACTO_MODIFIABLE];

    if (modifiables instanceof Set) {
        modifiables.forEach((key: unknown) => {
            const k = key as keyof T;

            if (typeof k === "string" && k in obj) {
                const type = typeof obj[k];
                if (type === "string" || type === "number" || type === "boolean") {
                    modifiableAttributes[k] = obj[k];
                } else {
                    console.error(type, "Cannot modify a property that is not a string, number, or boolean");
                }
            }
        });
    }
    return modifiableAttributes;
}
