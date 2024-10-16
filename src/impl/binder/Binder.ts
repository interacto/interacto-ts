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

import {isEltRef} from "../../api/binder/BaseBinderBuilder";
import {AnonCmd} from "../command/AnonCmd";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import type {CmdBinder} from "../../api/binder/CmdBinder";
import type {InteractionBinder} from "../../api/binder/InteractionBinder";
import type {InteractionCmdBinder} from "../../api/binder/InteractionCmdBinder";
import type {When, WhenType} from "../../api/binder/When";
import type {Binding} from "../../api/binding/Binding";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {RuleName, Severity} from "../../api/checker/Checker";
import type {Command} from "../../api/command/Command";
import type {Interaction, InteractionDataType} from "../../api/interaction/Interaction";
import type {Logger} from "../../api/logging/Logger";
import type {LogLevel} from "../../api/logging/LogLevel";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";

/**
 * The base class that defines the concept of binding builder (called binder).
 * @typeParam C - The type of the action to produce.
 * @typeParam I - The type of the user interaction to bind.
 * @category Binding
 */
export abstract class Binder<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
implements CmdBinder<C>, InteractionBinder<I, A, D>, InteractionCmdBinder<C, I, A, D> {

    protected firstFn?: (c: C, i: D, acc: A) => void;

    protected produceFn?: (i: D | undefined) => C;

    protected widgets: ReadonlyArray<unknown>;

    protected dynamicNodes: ReadonlyArray<Node>;

    protected usingFn?: () => I;

    protected hadEffectsFn?: (c: C, i: D, acc: A) => void;

    protected hadNoEffectFn?: (c: C, i: D, acc: A) => void;

    protected cannotExecFn?: (c: C, i: D, acc: A) => void;

    protected endFn?: (c: C, i: D, acc: A) => void;

    protected onErrFn?: (ex: unknown) => void;

    protected logLevels: ReadonlyArray<LogLevel>;

    protected stopPropagation: boolean;

    protected prevDefault: boolean;

    protected bindingName: string | undefined;

    protected observer: BindingsObserver | undefined;

    protected undoHistory: UndoHistoryBase;

    protected logger: Logger;

    protected whenFnArray: Array<When<D, A>> = [];

    protected firstFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected endFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected hadEffectsFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected hadNoEffectFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected cannotExecFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected onErrFnArray: Array<(ex: unknown) => void> = [];

    protected accInit: A | undefined;

    protected linterRules: Map<RuleName, Severity>;

    protected constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver,
                          binder?: Partial<Binder<C, I, A, D>>, acc?: A) {
        this.widgets = [];
        this.dynamicNodes = [];
        this.logLevels = [];
        this.linterRules = new Map();
        this.stopPropagation = false;
        this.prevDefault = false;

        Object.assign(this, binder);

        this.accInit = acc;
        this.undoHistory = undoHistory;
        this.logger = logger;
        this.observer = observer;

        this.copyFnArrays();
    }

    protected abstract duplicate(): Binder<C, I, A, D>;

    /**
     * Clones the arrays containing the routine functions after a binder is copied.
     */
    protected copyFnArrays(): void {
        // Clones the arrays (instead of just copying the reference from the previous binder)
        this.whenFnArray = Array.from(this.whenFnArray);

        this.firstFnArray = Array.from(this.firstFnArray);
        this.firstFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.firstFnArray) {
                fn(c, i, acc);
            }
        };
        this.endFnArray = Array.from(this.endFnArray);
        this.endFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.endFnArray) {
                fn(c, i, acc);
            }
        };
        this.hadEffectsFnArray = Array.from(this.hadEffectsFnArray);
        this.hadEffectsFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.hadEffectsFnArray) {
                fn(c, i, acc);
            }
        };
        this.hadNoEffectFnArray = Array.from(this.hadNoEffectFnArray);
        this.hadNoEffectFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.hadNoEffectFnArray) {
                fn(c, i, acc);
            }
        };
        this.cannotExecFnArray = Array.from(this.cannotExecFnArray);
        this.cannotExecFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.cannotExecFnArray) {
                fn(c, i, acc);
            }
        };
        this.onErrFnArray = Array.from(this.onErrFnArray);
        this.onErrFn = (ex: unknown): void => {
            for (const fn of this.onErrFnArray) {
                fn(ex);
            }
        };
    }

    public on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): Binder<C, I, A, D> {
        const ws = Array
            .from(widgets)
            .concat(widget)
            .map(currWidget => {
                if (isEltRef(currWidget)) {
                    return currWidget.nativeElement;
                }
                return currWidget;
            });
        const currWidget: ReadonlyArray<unknown> = this.widgets.length === 0 ? ws : Array.from(this.widgets).concat(ws);
        const dup = this.duplicate();
        dup.widgets = currWidget;
        return dup;
    }

    public onDynamic(node: Widget<Node>): Binder<C, I, A, D> {
        const dup = this.duplicate();
        const nodeEvt = isEltRef(node) ? node.nativeElement : node;
        dup.dynamicNodes = Array.from(this.dynamicNodes).concat(nodeEvt);
        return dup;
    }

    public first(fn: (c: C, i: D, acc: A) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.firstFnArray.push(fn);
        return dup;
    }

    public when(fn: (i: D, acc: Readonly<A>) => boolean, mode: WhenType = "nonStrict"): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.whenFnArray.push({
            fn,
            "type": mode
        });
        return dup;
    }

    public ifHadEffects(fn: (c: C, i: D, acc: A) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.hadEffectsFnArray.push(fn);
        return dup;
    }

    public ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.hadNoEffectFnArray.push(fn);
        return dup;
    }

    public ifCannotExecute(fn: (c: C, i: D, acc: A) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.cannotExecFnArray.push(fn);
        return dup;
    }

    public end(fn: (c: C, i: D, acc: A) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.endFnArray.push(fn);
        return dup;
    }

    public log(...level: ReadonlyArray<LogLevel>): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.logLevels = Array.from(level);
        return dup;
    }

    public stopImmediatePropagation(): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.stopPropagation = true;
        return dup;
    }

    public preventDefault(): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.prevDefault = true;
        return dup;
    }

    public catch(fn: (ex: unknown) => void): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.onErrFnArray.push(fn);
        return dup;
    }

    public name(name: string): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.bindingName = name;
        return dup;
    }

    public configureRules(ruleName: RuleName, severity: Severity): Binder<C, I, A, D> {
        const dup = this.duplicate();
        dup.linterRules.set(ruleName, severity);
        return dup;
    }

    public usingInteraction<I2 extends Interaction<D2>, A2, D2 extends object = InteractionDataType<I2>>
    (fn: () => I2): Binder<C, I2, A2, D2> {
        const dup = this.duplicate();
        dup.usingFn = fn as unknown as () => I;
        return dup as unknown as Binder<C, I2, A2, D2>;
    }

    public toProduce<C2 extends Command>(fn: (i: D) => C2): Binder<C2, I, A, D> {
        const dup = this.duplicate();
        dup.produceFn = fn as unknown as (i: D | undefined) => C;
        return dup as unknown as Binder<C2, I, A, D>;
    }

    public toProduceAnon(fn: () => void): Binder<Command, I, A, D> {
        const dup = this.duplicate();
        dup.produceFn = ((): Command => new AnonCmd(fn)) as unknown as (i: D | undefined) => C;
        return dup as unknown as Binder<Command, I, A, D>;
    }

    public abstract bind(): Binding<C, I, A, D>;
}
