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

import {Binder} from "./Binder";
import {AnonBinding} from "../binding/AnonBinding";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import type {CmdUpdateBinder} from "../../api/binder/CmdUpdateBinder";
import type {InteractionCmdUpdateBinder} from "../../api/binder/InteractionCmdUpdateBinder";
import type {WhenType} from "../../api/binder/When";
import type {Binding} from "../../api/binding/Binding";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {RuleName, Severity} from "../../api/checker/Checker";
import type {Command} from "../../api/command/Command";
import type {Interaction, InteractionDataType} from "../../api/interaction/Interaction";
import type {Logger} from "../../api/logging/Logger";
import type {LogLevel} from "../../api/logging/LogLevel";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";

/**
 * The base binding builder for bindings where commands can be updated while the user interaction is running.
 * @typeParam C - The type of the command to produce.
 * @category Binding
 */
export class UpdateBinder<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    extends Binder<C, I, A, D> implements CmdUpdateBinder<C>, InteractionCmdUpdateBinder<C, I, A, D> {

    protected thenFn?: (c: C, i: D, acc: A) => void;

    protected cancelFn?: (i: D, acc: A) => void;

    protected endOrCancelFn?: (i: D, acc: A) => void;

    protected continuousCmdExecution: boolean;

    protected throttleTimeout: number;

    protected thenFnArray: Array<(c: C, i: D, acc: A) => void> = [];

    protected cancelFnArray: Array<(i: D, acc: A) => void> = [];

    protected endOrCancelFnArray: Array<(i: D, acc: A) => void> = [];

    public constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver,
                       binder?: Partial<UpdateBinder<C, I, A, D>>, acc?: A) {
        super(undoHistory, logger, observer, binder, acc);

        this.continuousCmdExecution = false;
        this.throttleTimeout = 0;
        Object.assign(this, binder);

        // Arrays have to be cloned again in each subclass of Binder after Object.assign() since it undoes the changes
        this.copyFnArraysUpdate();
    }

    protected copyFnArraysUpdate(): void {
        super.copyFnArrays();
        this.thenFnArray = Array.from(this.thenFnArray);
        this.thenFn = (c: C, i: D, acc: A): void => {
            for (const fn of this.thenFnArray) {
                fn(c, i, acc);
            }
        };
        this.cancelFnArray = Array.from(this.cancelFnArray);
        this.cancelFn = (i: D, acc: A): void => {
            for (const fn of this.cancelFnArray) {
                fn(i, acc);
            }
        };
        this.endOrCancelFnArray = Array.from(this.endOrCancelFnArray);
        this.endOrCancelFn = (i: D, acc: A): void => {
            for (const fn of this.endOrCancelFnArray) {
                fn(i, acc);
            }
        };
    }

    public then(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.thenFnArray.push(fn);
        return dup;
    }

    public continuousExecution(): UpdateBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.continuousCmdExecution = true;
        return dup;
    }

    public cancel(fn: (i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.cancelFnArray.push(fn);
        return dup;
    }

    public endOrCancel(fn: (i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.endOrCancelFnArray.push(fn);
        return dup;
    }

    public throttle(timeout: number): UpdateBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.throttleTimeout = timeout;
        return dup;
    }

    public override on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): UpdateBinder<C, I, A, D> {
        return super.on(widget, ...widgets) as UpdateBinder<C, I, A, D>;
    }

    public override onDynamic(node: Widget<Node>): UpdateBinder<C, I, A, D> {
        return super.onDynamic(node) as UpdateBinder<C, I, A, D>;
    }

    public override first(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        return super.first(fn) as UpdateBinder<C, I, A, D>;
    }

    public override when(fn: (i: D, acc: Readonly<A>) => boolean, mode?: WhenType): UpdateBinder<C, I, A, D> {
        return super.when(fn, mode) as UpdateBinder<C, I, A, D>;
    }

    public override ifHadEffects(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        return super.ifHadEffects(fn) as UpdateBinder<C, I, A, D>;
    }

    public override ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        return super.ifHadNoEffect(fn) as UpdateBinder<C, I, A, D>;
    }

    public override ifCannotExecute(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        return super.ifCannotExecute(fn) as UpdateBinder<C, I, A, D>;
    }

    public override end(fn: (c: C, i: D, acc: A) => void): UpdateBinder<C, I, A, D> {
        return super.end(fn) as UpdateBinder<C, I, A, D>;
    }

    public override log(...level: ReadonlyArray<LogLevel>): UpdateBinder<C, I, A, D> {
        return super.log(...level) as UpdateBinder<C, I, A, D>;
    }

    public override stopImmediatePropagation(): UpdateBinder<C, I, A, D> {
        return super.stopImmediatePropagation() as UpdateBinder<C, I, A, D>;
    }

    public override preventDefault(): UpdateBinder<C, I, A, D> {
        return super.preventDefault() as UpdateBinder<C, I, A, D>;
    }

    public override catch(fn: (ex: unknown) => void): UpdateBinder<C, I, A, D> {
        return super.catch(fn) as UpdateBinder<C, I, A, D>;
    }

    public override name(name: string): UpdateBinder<C, I, A, D> {
        return super.name(name) as UpdateBinder<C, I, A, D>;
    }

    public override configureRules(ruleName: RuleName, severity: Severity): UpdateBinder<C, I, A, D> {
        return super.configureRules(ruleName, severity) as UpdateBinder<C, I, A, D>;
    }

    public override usingInteraction<I2 extends Interaction<D2>, A2, D2 extends object = InteractionDataType<I2>>
    (fn: () => I2): UpdateBinder<C, I2, A2, D2> {
        return super.usingInteraction(fn) as UpdateBinder<C, I2, A2, D2>;
    }

    public override toProduce<C2 extends Command>(fn: (i: D) => C2): UpdateBinder<C2, I, A, D> {
        return super.toProduce(fn) as UpdateBinder<C2, I, A, D>;
    }

    public override toProduceAnon(fn: () => void): UpdateBinder<Command, I, A, D> {
        return super.toProduceAnon(fn) as UpdateBinder<Command, I, A, D>;
    }

    protected duplicate(): UpdateBinder<C, I, A, D> {
        return new UpdateBinder<C, I, A, D>(this.undoHistory, this.logger, this.observer, this);
    }

    public bind(): Binding<C, I, A, D> {
        if (this.usingFn === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.produceFn === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.usingFn(), this.undoHistory, this.logger, this.produceFn,
            Array.from(this.widgets), Array.from(this.dynamicNodes), Array.from(this.logLevels),
            this.throttleTimeout, this.stopPropagation, this.prevDefault, new Map(this.linterRules), this.firstFn, this.thenFn,
            Array.from(this.whenFnArray), this.endFn, this.cancelFn, this.endOrCancelFn, this.hadEffectsFn,
            this.hadNoEffectFn, this.cannotExecFn, this.onErrFn, this.bindingName, this.accInit);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
