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
 * The different mode that define when the 'when' predicate must be executed.
 * Note that there is no 'strictEnd' since the end of a binding execution is by default strict.
 * Note that there is no 'start' (just 'strictStart') since 'then' encompasses 'start'.
 * Strict modes cancel the binding execution, while non-strict modes just prevent the creation/execution of the
 * command at a given instant.
 */
export type WhenType =
/** The predicate will be executed at the end and will cancel the binding execution if not fulfilled. */
"end" |
/** The predicate will be executed at start/then/end without cancelling the binding execution. */
"nonStrict" |
/** The predicate will be executed at start/then/end and will cancel the binding execution if not fulfilled. */
"strict" |
/** The predicate will be executed at start and will cancel the binding execution if not fulfilled. */
"strictStart" |
/** The predicate will be executed at start and at each update and will cancel the binding execution if not fulfilled. */
"strictThen" |
/** The predicate will be executed at start and at each update without cancelling the binding execution. */
"then";

/**
 * States whether the WhenType concerns the beginning of a binding execution (at start).
 * Not that 'then' is included since 'then' is called at start. This includes both strict and non strict mode.
 * @param type -- The WhenType to test
 * @returns True: when executed at start
 */
export function isWhenAtStart(type: WhenType): boolean {
    // 'then' is triggered at 'start' so used here
    return type === "strictStart" || type === "then" || type === "nonStrict" || type === "strict";
}

/**
 * States whether the WhenType concerns the running of a binding execution.
 * This includes both strict and non strict mode.
 * @param type -- The WhenType to test
 * @returns True: when executed at then
 */
export function isWhenAtThen(type: WhenType): boolean {
    return type === "strictThen" || type === "then" || type === "nonStrict" || type === "strict";
}

/**
 * States whether the WhenType concerns the end of a binding execution.
 * This includes both strict and non strict mode.
 * @param type -- The WhenType to test
 * @returns True: when executed at end
 */
export function isWhenAtEnd(type: WhenType): boolean {
    return type === "end" || type === "nonStrict" || type === "strict";
}

/**
 * States whether the WhenType is a strict mode.
 * @param type -- The WhenType to test
 * @returns True: when is strict
 */
export function isWhenStrict(type: WhenType): boolean {
    // 'end' is always strict
    return type === "end" || type === "strict" || type === "strictThen" || type === "strictStart";
}

/**
 * The type of a when condition: it contains both the predicate and the mode (ie when the predicate must be checked).
 * @typeParam D -- The interaction data type
 */
export interface When<D, A> {
    /**
     * The predicate.
     * @param i -- The interaction data.
     */
    fn: (i: D, acc: Readonly<A>) => boolean;

    /**
     * The type of the when
     */
    type: WhenType;
}

