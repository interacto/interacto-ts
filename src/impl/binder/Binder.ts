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
import type {UndoHistory} from "../../api/undo/UndoHistory";
import type {Logger} from "../../api/logging/Logger";

/**
 * The base class that defines the concept of binding builder (called binder).
 * @typeParam C - The type of the action to produce.
 * @typeParam I - The type of the user interaction to bind.
 */
export abstract class Binder<C extends Command, I extends Interaction<D>, D extends InteractionData>
implements CmdBinder<C>, InteractionBinder<I, D>, InteractionCmdBinder<C, I, D> {

    protected firstFn?: (c: C, i: D) => void;

    protected whenFn?: (i: D) => boolean;

    protected produceFn?: (i: D) => C;

    protected widgets: ReadonlyArray<EventTarget>;

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

    protected undoHistory: UndoHistory;

    protected logger: Logger;

    protected whenFnArray: Array<(i: D) => boolean> = new Array<(i: D) => boolean>();

    protected firstFnArray: Array<(c: C, i: D) => void> = new Array<(c: C, i: D) => void>();

    protected endFnArray: Array<(c: C, i: D) => void> = new Array<(c: C, i: D) => void>();

    protected constructor(undoHistory: UndoHistory, logger: Logger, observer?: BindingsObserver, binder?: Partial<Binder<C, I, D>>) {
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
        // Clones the array (instead of just copying the reference from the previous binder)
        this.whenFnArray = [...this.whenFnArray];
        // Updates the routine to use the new array reference
        this.whenFn = (i): boolean => this.whenFnArray.every(fn => fn(i));

        this.firstFnArray = [...this.firstFnArray];
        this.firstFn = (c: C, i: D): void => {
            this.firstFnArray.forEach(fn => {
                fn(c, i);
            });
        };
        this.endFnArray = [...this.endFnArray];
        this.endFn = (c: C, i: D): void => {
            this.endFnArray.forEach(fn => {
                fn(c, i);
            });
        };
    }

    public on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    Binder<C, I, D> {
        const ws = [...widgets].concat(widget).map(w => {
            if (isEltRef(w)) {
                return w.nativeElement;
            }
            return w;
        });
        const w: ReadonlyArray<EventTarget> = this.widgets.length === 0 ? ws : [...this.widgets].concat(ws);
        const dup = this.duplicate();
        dup.widgets = w;
        return dup;
    }

    public onDynamic(node: Widget<Node>): Binder<C, I, D> {
        const dup = this.duplicate();
        const nodeEvt = isEltRef(node) ? node.nativeElement : node;
        dup.dynamicNodes = [...this.dynamicNodes].concat(nodeEvt);
        return dup;
    }

    public first(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.firstFnArray.push(fn);
        return dup;
    }

    public when(fn: (i: D) => boolean): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.whenFnArray.push(fn);
        return dup;
    }

    public ifHadEffects(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadEffectsFn = fn;
        return dup;
    }

    public ifHadNoEffect(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.hadNoEffectFn = fn;
        return dup;
    }

    public ifCannotExecute(fn: (c: C, i: D) => void): Binder<C, I, D> {
        const dup = this.duplicate();
        dup.cannotExecFn = fn;
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
        dup.onErrFn = fn;
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

    public abstract bind(): Binding<C, I, D>;
}
