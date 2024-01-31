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

import {Click} from "../interaction/library/Click";
import {Clicks} from "../interaction/library/Clicks";
import {DoubleClick} from "../interaction/library/DoubleClick";
import {DragLock} from "../interaction/library/DragLock";
import {KeyDown} from "../interaction/library/KeyDown";
import {KeysTyped} from "../interaction/library/KeysTyped";
import {KeyTyped} from "../interaction/library/KeyTyped";
import {KeyUp} from "../interaction/library/KeyUp";
import {LongMouseDown} from "../interaction/library/LongMouseDown";
import {MouseDown} from "../interaction/library/MouseDown";
import {MouseUp} from "../interaction/library/MouseUp";
import {MultiTouch} from "../interaction/library/MultiTouch";
import {leftPan, rightPan, vPan, hPan, topPan, bottomPan} from "../interaction/library/Pans";
import {TouchDnD} from "../interaction/library/TouchDnD";
import {twoBottomPan, twoHPan, twoLeftPan, twoRightPan, twoTopPan, twoVPan} from "../interaction/library/TwoPans";
import type {Binding} from "../../api/binding/Binding";
import type {Checker, LinterRule, RuleName, Severity} from "../../api/checker/Checker";
import type {Command} from "../../api/command/Command";
import type {Interaction} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";

/**
 * An implementation of the Checker API
 * @category Checker
 */
export class CheckerImpl implements Checker {
    private readonly linterRules: Map<RuleName, Severity>;

    private readonly cacheIncluded: Map<string, Set<string>>;

    public constructor() {
        this.linterRules = new Map();
        this.linterRules.set("same-interactions", "ignore");
        this.linterRules.set("same-data", "ignore");
        this.linterRules.set("included", "ignore");
        this.cacheIncluded = new Map();
    }

    public setLinterRules(...rules: ReadonlyArray<LinterRule>): void {
        for (const rule of rules) {
            this.linterRules.set(rule[0], rule[1]);
        }
        if (this.getIncludedSeverity() !== "ignore") {
            this.fillCacheIncluded();
        }
    }

    public checkRules(binding: Binding<Command, Interaction<InteractionData>, unknown>,
                      binds: ReadonlyArray<Binding<Command, Interaction<InteractionData>, unknown>>): void {
        this.checkSameData(binding, binds);
        // Do not check same-interaction if already checked same-data with the same severity
        if (this.getSameDataSeverity() !== this.getSameInteractionSeverity()) {
            this.checkSameInteractions(binding, binds);
        }
        this.checkIncluded(binding, binds);
    }

    public checkSameInteractions(binding: Binding<Command, Interaction<InteractionData>, unknown>,
                                 binds: ReadonlyArray<Binding<Command, Interaction<InteractionData>, unknown>>): void {
        // support OR by splitting name with -
        this.checkRule("same-interactions", this.getSameInteractionSeverity(binding), binding, binds,
            currBinding => binding.interaction.name === currBinding.interaction.name,
            "[same-interactions] Two bindings use the same user interaction on same widget.");
    }

    public checkSameData(binding: Binding<Command, Interaction<InteractionData>, unknown>,
                         binds: ReadonlyArray<Binding<Command, Interaction<InteractionData>, unknown>>): void {
        this.checkRule("same-data", this.getSameDataSeverity(binding), binding, binds,
            currBinding => binding.interaction.data.constructor === currBinding.interaction.data.constructor,
            "[same-data] Two bindings use the same user interaction data type on same widget.");
    }

    public checkIncluded(binding: Binding<Command, Interaction<InteractionData>, unknown>,
                         binds: ReadonlyArray<Binding<Command, Interaction<InteractionData>, unknown>>): void {
        // support OR
        this.checkRule("included", this.getIncludedSeverity(binding), binding, binds,
            currBinding => this.isIncluded(binding.interaction.name, currBinding.interaction.name),
            "[included] The interaction of the first binding is included into the interaction of a second one.");
    }

    private checkRule(ruleName: RuleName, severity: Severity,
                      binding: Binding<Command, Interaction<InteractionData>, unknown>,
                      binds: ReadonlyArray<Binding<Command, Interaction<InteractionData>, unknown>>,
                      predicate: (b: Binding<Command, Interaction<InteractionData>, unknown>) => boolean, msg: string): void {
        if (severity !== "ignore" && !binding.isWhenDefined() &&
            binds
                .filter(currBinding => currBinding.linterRules.get(ruleName) !== "ignore" && !currBinding.isWhenDefined())
                .some(currBinding => predicate(currBinding) &&
                    this.isWidgetSetsIntersecting(binding.interaction.registeredNodes, currBinding.interaction.registeredNodes))
        ) {
            this.printLinterMsg(severity, msg);
        }
    }

    private isIncluded(i1: string, i2: string): boolean {
        return (this.cacheIncluded.get(i1)?.has(i2) ?? false) || (this.cacheIncluded.get(i2)?.has(i1) ?? false);
    }

    private getSameDataSeverity(binding?: Binding<Command, Interaction<InteractionData>, unknown>): Severity {
        return binding?.linterRules.get("same-data") ?? this.linterRules.get("same-data") ?? "err";
    }

    private getSameInteractionSeverity(binding?: Binding<Command, Interaction<InteractionData>, unknown>): Severity {
        return binding?.linterRules.get("same-interactions") ?? this.linterRules.get("same-interactions") ?? "err";
    }

    private getIncludedSeverity(binding?: Binding<Command, Interaction<InteractionData>, unknown>): Severity {
        return binding?.linterRules.get("included") ?? this.linterRules.get("included") ?? "err";
    }

    private isWidgetSetsIntersecting(w1: ReadonlySet<unknown>, w2: ReadonlySet<unknown>): boolean {
        return Array.from(w1.values()).some(widget => w2.has(widget));
    }

    private printLinterMsg(severity: Severity, msg: string): void {
        if (severity === "err") {
            throw new Error(msg);
        } else {
            // eslint-disable-next-line no-console
            console.warn(msg);
        }
    }

    private fillCacheIncluded(): void {
        if (this.cacheIncluded.size === 0) {
            this.cacheIncluded.set(Click.name, new Set([DragLock.name, DoubleClick.name, Clicks.name]));
            this.cacheIncluded.set(DoubleClick.name, new Set([DragLock.name]));
            this.cacheIncluded.set(KeyDown.name, new Set([KeyTyped.name]));
            this.cacheIncluded.set(KeyUp.name, new Set([KeyTyped.name]));
            this.cacheIncluded.set(KeyTyped.name, new Set([KeysTyped.name]));
            this.cacheIncluded.set(LongMouseDown.name, new Set([Click.name, DoubleClick.name, Clicks.name]));
            this.cacheIncluded.set(MouseDown.name, new Set([LongMouseDown.name, Click.name, DoubleClick.name, Clicks.name]));
            this.cacheIncluded.set(MouseUp.name, new Set([Click.name, DoubleClick.name, Clicks.name]));
            this.cacheIncluded.set(leftPan.name, new Set([hPan.name, TouchDnD.name]));
            this.cacheIncluded.set(rightPan.name, new Set([hPan.name, TouchDnD.name]));
            this.cacheIncluded.set(topPan.name, new Set([vPan.name, TouchDnD.name]));
            this.cacheIncluded.set(bottomPan.name, new Set([vPan.name, TouchDnD.name]));
            this.cacheIncluded.set(hPan.name, new Set([TouchDnD.name]));
            this.cacheIncluded.set(vPan.name, new Set([TouchDnD.name]));
            this.cacheIncluded.set(twoHPan.name, new Set([MultiTouch.name]));
            this.cacheIncluded.set(twoVPan.name, new Set([MultiTouch.name]));
            this.cacheIncluded.set(twoLeftPan.name, new Set([twoHPan.name, MultiTouch.name]));
            this.cacheIncluded.set(twoRightPan.name, new Set([twoHPan.name, MultiTouch.name]));
            this.cacheIncluded.set(twoTopPan.name, new Set([twoVPan.name, MultiTouch.name]));
            this.cacheIncluded.set(twoBottomPan.name, new Set([twoVPan.name, MultiTouch.name]));
        }
    }
}

