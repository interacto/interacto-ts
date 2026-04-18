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

import {CommandBase} from "../../impl/command/CommandBase";

const INTERACTO_SELECTIVE: unique symbol = Symbol("interacto-cmd-selective");

interface SelectiveMetadata {
    /**
     * A metadata to associate to a command constructor to identify the properties to operate as
     * primary keys be used by the selective history engine.
     */
    [INTERACTO_SELECTIVE]?: Set<string>;
}

/**
 * The Interacto decorator to mark one command's property as the selective property.
 * Cannot check the type of the property here (requires reflect-metadata we do not want to install).
 * @param target - The targeted command.
 * @param propertyName - The name of the property the decorator targets.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Selective(target: unknown, propertyName: string): void {
    if (!(target instanceof CommandBase)) {
        // eslint-disable-next-line no-console
        console.error("The @Selective decorator currently operates on Interacto commands only");
        return;
    }

    // Getting the object cache related to the modifiable symbol
    const symbolValues: unknown = (target.constructor as SelectiveMetadata)[INTERACTO_SELECTIVE];
    const set = symbolValues instanceof Set ? symbolValues as Set<string> : new Set<string>();

    // Adding the property in this cache
    set.add(propertyName);
    (target.constructor as SelectiveMetadata)[INTERACTO_SELECTIVE] = set;
}

/**
 * Gets the selective entries (key/value) of the given object.
 * @param obj - The object to analyze that may contain selective properties.
 * @returns `undefined` if the object is not selective. A set of entries (key/value) corresponding
 * to the selective keys and their values of the given object.
 */
export function getSelectiveValue<T extends object>(obj: T): Partial<T> | undefined {
    const keys: unknown = (obj.constructor as SelectiveMetadata)[INTERACTO_SELECTIVE];

    if (keys instanceof Set) {
        const filteredKeys = [...keys.values()]
            // Removing the keys that are not part of the object.
            // Normally should never happen since they have the Selective decorator on them.
            .filter(key => (key in obj))
            // Casting as a key of T
            .map(key => key as keyof T);

        const res = {} as Partial<T>;
        for (const key of filteredKeys) {
            res[key] = obj[key];
        }
        return res;
    }
    return undefined;
}

/**
 * Checks whether the given object and its given are modifiable
 * @param obj - The command to modify
 * @returns True if the property of the command can be modified.
 */
export function isCmdSelective<T extends object>(obj: T): boolean {
    return getSelectiveValue(obj) !== undefined;
}

/**
 * Checks whether the given object is selective and its selective property is the same
 * object as `value`.
 * @param obj - The selective object to check
 * @param value - The object value that will be compared to the selective property of the given object
 * @param eqFn - The function to compare the selective keys. If not specified, the comparison will be
 * done using the === operator.
 * @returns True if the given object is selective and its selective property has as value the given `value`
 */
export function hasSelectiveValue<V extends object | number | string>(
    obj: object, value: V, eqFn: ((v1: V, v2: V) => boolean) = (v1, v2) => v1 === v2): boolean {

    const res = getSelectiveValue(obj);

    return res !== undefined && Object
        .entries(res)
        .some(([, keyValue]) => eqFn(keyValue as V, value));
}
