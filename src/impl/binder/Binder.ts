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

import type {LogLevel} from "../../api/logging/LogLevel";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {Command} from "../../api/command/Command";
import type {CmdBinder} from "../../api/binder/CmdBinder";
import type {InteractionBinder} from "../../api/binder/InteractionBinder";
import type {InteractionCmdBinder} from "../../api/binder/InteractionCmdBinder";
import type {Binding} from "../../api/binding/Binding";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {Interaction} from "../../api/interaction/Interaction";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import {isEltRef} from "../../api/binder/BaseBinderBuilder";
import type {Logger} from "../../api/logging/Logger";
import {AnonCmd} from "../command/AnonCmd";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";
import type {When} from "../../api/binder/When";
import {WhenType} from "../../api/binder/When";

/**
 * The base class that defines the concept of binding builder (called binder).
 * @typeParam C - The type of the action to produce.
 * @typeParam I - The type of the user interaction to bind.
 */
export abstract class Binder<C extends Command, I extends Interaction<D>, D extends InteractionData>
implements CmdBinder<C>, InteractionBinder<I, D>, InteractionCmdBinder<C, I, D> {

    protected firstFn?: (c: C, i: D) => void;

    protected produceFn?: (i: D) => C;

    protected widgets: ReadonlyArray<unknown>;

    protected dynamicNodes: ReadonlyArray<Node>;

    protected usingFn?: () => I;

    protected hadEffectsFn?: (c: C, i: D) => void;

    protected hadNoEffectFn?: (c: C, i: D) => void;

    protected cannotExecFn?: (c: C, i: D) => void;

    protected endFn?: (c: C, i: D) => void;

    protected onErrFn?: (ex: unknown) => void;

    protected logLevels: ReadonlyArray<LogLevel>;

    protected stopPropagation: boolean;

    protected prevDefault: boolean;

    protected bindingName?: string;

    protected observer?: BindingsObserver;

    protected undoHistory: UndoHistoryBase;

    protected logger: Logger;

    protected whenFnArray: Array<When<D>> = [];

    protected firstFnArray: Array<(c: C, i: D) => void> = [];

    protected endFnArray: Array<(c: C, i: D) => void> = [];

    protected hadEffectsFnArray: Array<(c: C, i: D) => void> = [];

    protected hadNoEffectFnArray: Array<(c: C, i: D) => void> = [];

    protected cannotExecFnArray: Array<(c: C, i: D) => void> = [];

    protected onErrFnArray: Array<(ex: unknown) => void> = [];

    protected constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver, binder?: Partial<Binder<C, I, D>>) {
        Object.assign(this, binder);

        this.undoHistory = undoHistory;
        this.logger = logger;
        this.widgets ??= [];
        this.dynamicNodes ??= [];
        this.logLevels ??= [];
        this.stopPropagation ??= false;
        this.prevDefault ??= false;
        this.observer = observer;

        this.copyFnArrays();
    }

    protected abstract duplicate(): Binder<C, I, D>;

    /**
     * Clones the arrays containing the routine functions after a binder is copied.
     */
    protected copyFnArrays(): void {
        // Clones the arrays (instead of just copying the reference from the previous binder)
        this.whenFnArray = [...this.whenFnArray];

        this.firstFnArray = [...this.firstFnArray];
        this.firstFn = (c: C, i: D): void => {
            for (const fn of this.firstFnArray) {
                fn(c, i);
            }
        };
        this.endFnArray = [...this.endFnArray];
        this.endFn = (c: C, i: D): void => {
            for (const fn of this.endFnArray) {
                fn(c, i);
            }
        };
        this.hadEffectsFnArray = [...this.hadEffectsFnArray];
        this.hadEffectsFn = (c: C, i: D): void => {
            for (const fn of this.hadEffectsFnArray) {
                fn(c, i);
            }
        };
        this.hadNoEffectFnArray = [...this.hadNoEffectFnArray];
        this.hadNoEffectFn = (c: C, i: D): void => {
            for (const fn of this.hadNoEffectFnArray) {
                fn(c, i);
            }
        };
        this.cannotExecFnArray = [...this.cannotExecFnArray];
        this.cannotExecFn = (c: C, i: D): void => {
            for (const fn of this.cannotExecFnArray) {
                fn(c, i);
            }
        };
        this.onErrFnArray = [...this.onErrFnArray];
        this.onErrFn = (ex: unknown): void => {
            for (const fn of this.onErrFnArray) {
                fn(ex);
            }
        };
    }

    public on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): Binder<C, I, D> {
        // eslint-disable-next-line unicorn/prefer-spread
        const ws = [...widgets].concat(widget).map(w => {
            if (isEltRef(w)) {
                return w.nativeElement;
            }
            return w;
        });
        // eslint-disable-next-line unicorn/prefer-spread
        const w: ReadonlyArray<unknown> = this.widgets.length === 0 ? ws : [...this.widgets].concat(ws);
        const dup = this.duplicate();
        dup.widgets = w;
        return dup;
    }

    public onDynamic(node: Widget<Node>): Binder<C, I, D> {
        const dup = this.duplicate();
        const nodeEvt = isEltRef(node) ? node.nativeElement : node;
        // eslint-disable-next-line unicorn/prefer-spread
        dup.dynamicNodes = [...this.dynamicNodes].concat(nodeEvt);
        return dup;
    }

    public first(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.firstFnArray.push(fn);
        return dup;
    }

    public when(fn: (i: D) => boolean, mode: WhenType = WhenType.nonStrict): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.whenFnArray.push({
            fn,
            "type": mode
        });
        return dup;
    }

    public ifHadEffects(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadEffectsFnArray.push(fn);
        return dup;
    }

    public ifHadNoEffect(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadNoEffectFnArray.push(fn);
        return dup;
    }

    public ifCannotExecute(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.cannotExecFnArray.push(fn);
        return dup;
    }

    public end(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.endFnArray.push(fn);
        return dup;
    }

    public log(...level: ReadonlyArray<LogLevel>): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.logLevels = [...level];
        return dup;
    }

    public stopImmediatePropagation(): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.stopPropagation = true;
        return dup;
    }

    public preventDefault(): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.prevDefault = true;
        return dup;
    }

    public catch(fn: (ex: unknown) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.onErrFnArray.push(fn);
        return dup;
    }

    public name(name: string): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.bindingName = name;
        return dup;
    }

    public usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>(fn: () => I2): Binder<C, I2, D2> {
        const dup = this.duplicate();
        dup.usingFn = fn as unknown as () => I;
        return dup as unknown as Binder<C, I2, D2>;
    }

    public toProduce<C2 extends Command>(fn: (i: D) => C2): Binder<C2, I, D> {
        const dup = this.duplicate();
        dup.produceFn = fn as unknown as (i: D) => C;
        return dup as unknown as Binder<C2, I, D>;
    }

    public toProduceAnon(fn: () => void): Binder<AnonCmd, I, D> {
        const dup = this.duplicate();
        dup.produceFn = ((): AnonCmd => new AnonCmd(fn)) as unknown as (i: D) => C;
        return dup as unknown as Binder<AnonCmd, I, D>;
    }

    public abstract bind(): Binding<C, I, D>;
}
