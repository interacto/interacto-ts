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

const INTERACTO_MEMENTO: unique symbol = Symbol("interacto-cmd-memento");

interface MementoMetadata {
    [INTERACTO_MEMENTO]?: Map<string, unknown>;
}

/**
 * The Interacto decorator to mark one command's property as a property from which a memento must be created.
 * Cannot check the type of the property here (requires reflect-metadata we do not want to install).
 * @param target - The targeted command.
 * @param propertyName - The name of the property the decorator targets.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function Memento(target: unknown, propertyName: string): void {
    if (!(target instanceof Object)) {
        // eslint-disable-next-line no-console
        console.error("The @Memento decorator currently operates on objects only");
        return;
    }

    // Getting the object cache related to the modifiable symbol
    const symbolValues: unknown = (target.constructor as MementoMetadata)[INTERACTO_MEMENTO];
    const map = symbolValues instanceof Map ? symbolValues as Map<string, unknown> : new Map<string, unknown>();

    // Adding the property in this cache (setting its value to undefined for the moment)
    map.set(propertyName, undefined);
    (target.constructor as MementoMetadata)[INTERACTO_MEMENTO] = map;
}

/**
 * Retrieves the subset of attributes from an {@link Undoable} instance that are
 * considered being the memento of the object (i.e., annotated with `@Memento`)
 * @param obj - The object from which to extract memento properties.
 * @returns Partial<T> - An object (extracted from `obj`) containing only the properties that are
 * declared as being the memento.
 */
function getMementoProperties<T extends object>(obj: T): Partial<T> {
    const modifiableAttributes: Partial<T> = {};
    const mementoProps: unknown = (obj.constructor as MementoMetadata)[INTERACTO_MEMENTO];

    if (mementoProps instanceof Map) {
        for (const [key, value] of mementoProps.entries()) {
            const tkey = key as keyof T;
            modifiableAttributes[tkey] = value as T[keyof T];
        }
    }
    return modifiableAttributes;
}

/**
 * Retrieves the subset of attributes from an {@link Undoable} instance that are
 * considered being the memento of the object (i.e., annotated with `@Memento`)
 * @param obj - The object from which to restore the values using the stored memento properties.
 */
export function restoreMementoProperties<T extends object>(obj: T): void {
    for (const [propName, propMementoValue] of Object.entries(getMementoProperties(obj))) {
        const typedPropName = propName as keyof T;
        obj[typedPropName] = propMementoValue as T[keyof T];
    }
}

/**
 * Retrieves the subset of attributes from an {@link Undoable} instance that are
 * considered being the memento of the object (i.e., annotated with `@Memento`)
 * @param obj - The object from which to restore the values using the stored memento properties.
 */
export function createMementoProperties<T extends object>(obj: T): void {
    const mementoProps: unknown = (obj.constructor as MementoMetadata)[INTERACTO_MEMENTO];

    if (mementoProps instanceof Map) {
        for (const propName of mementoProps.keys()) {
            const typedPropName = propName as keyof T;
            mementoProps.set(propName, obj[typedPropName]);
        }
    }
}
