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

import type {Binding} from "../binding/Binding";
import type {Command} from "../command/Command";
import type {Interaction} from "../interaction/Interaction";

/**
 * A string type for the rule names.
 * @category Checker
 */
export type RuleName = "included" | "same-data" | "same-interactions";

/**
 * A string type for the severity level.
 * @category Checker
 */
export type Severity = "err" | "ignore" | "warn";

/**
 * A type that defines a linter rule.
 * @category Checker
 */
export type LinterRule = [name: RuleName, severity: Severity];

/**
 * The interaction type check.
 * @category Checker
 */
export interface Checker {
    /**
     * Defines the set of rules to check.
     * @param rules - The rules to check.
     */
    setLinterRules(...rules: ReadonlyArray<LinterRule>): void;

    /**
     * Checks the selected rules on the provided binding.
     * @param binding - The binding to check.
     * @param binds - The other bindings to analyze.
     */
    checkRules(binding: Binding<Command, Interaction<object>, unknown>,
        binds: ReadonlyArray<Binding<Command, Interaction<object>, unknown>>): void;

    /**
     * Checks the rule 'same interaction' on the provided binding.
     * @param binding - The binding to check.
     * @param binds - The other bindings to analyze.
     */
    checkSameInteractions(binding: Binding<Command, Interaction<object>, unknown>,
        binds: ReadonlyArray<Binding<Command, Interaction<object>, unknown>>): void;

    /**
     * Checks the rule 'same data' on the provided binding.
     * @param binding - The binding to check.
     * @param binds - The other bindings to analyze.
     */
    checkSameData(binding: Binding<Command, Interaction<object>, unknown>,
        binds: ReadonlyArray<Binding<Command, Interaction<object>, unknown>>): void;

    /**
     * Checks the rule 'included' on the provided binding.
     * @param binding - The binding to check.
     * @param binds - The other bindings to analyze.
     */
    checkIncluded(binding: Binding<Command, Interaction<object>, unknown>,
        binds: ReadonlyArray<Binding<Command, Interaction<object>, unknown>>): void;
}
