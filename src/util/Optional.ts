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

export class Optional<T> {
    private static readonly EMPTY: Optional<{}> = new Optional<{}>();
    private readonly value?: T;

    private constructor(obj?: T) {
        this.value = obj;
    }

    public static empty<T>(): Optional<T> {
        return Optional.EMPTY as Optional<T>;
    }

    public static of<T>(obj?: T): Optional<T> {
        return obj === undefined ? Optional.empty() : new Optional(obj);
    }

    public get(): T | undefined {
        return this.value;
    }

    public isPresent(): boolean {
        return this.value !== undefined;
    }

    public ifPresent(lambda: (t: T) => void): void {
        if (this.value !== undefined) {
            lambda(this.value);
        }
    }

    public filter(predicate: (obj: T) => boolean): Optional<T> {
        if (!this.isPresent()) {
            return this;
        } else {
            return predicate(this.value as T) ? this : Optional.empty();
        }
    }

    public map<U>(fct: (t: T) => U): Optional<U> {
        return !this.isPresent() ? Optional.empty() : Optional.of(fct(this.value as T));
    }
}
