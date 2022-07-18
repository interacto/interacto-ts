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
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {Command} from "../../api/command/Command";
import type {CmdUpdateBinder} from "../../api/binder/CmdUpdateBinder";
import type {InteractionCmdUpdateBinder} from "../../api/binder/InteractionCmdUpdateBinder";
import type {LogLevel} from "../../api/logging/LogLevel";
import type {Binding} from "../../api/binding/Binding";
import {AnonBinding} from "../binding/AnonBinding";
import type {Interaction} from "../../api/interaction/Interaction";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {Logger} from "../../api/logging/Logger";
import type {AnonCmd} from "../command/AnonCmd";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";
import type {WhenType} from "../../api/binder/When";

/**
 * The base binding builder for bindings where commands can be updated while the user interaction is running.
 * @typeParam C - The type of the command to produce.
 */
export class UpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends Binder<C, I, D> implements CmdUpdateBinder<C>, InteractionCmdUpdateBinder<C, I, D> {

    protected thenFn?: (c: C, i: D) => void;

    protected cancelFn?: (i: D) => void;

    protected endOrCancelFn?: (i: D) => void;

    protected continuousCmdExecution: boolean;

    protected throttleTimeout: number;

    protected thenFnArray: Array<(c: C, i: D) => void> = [];

    protected cancelFnArray: Array<(i: D) => void> = [];

    protected endOrCancelFnArray: Array<(i: D) => void> = [];

    public constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver, binder?: Partial<UpdateBinder<C, I, D>>) {
        super(undoHistory, logger, observer, binder);

        Object.assign(this, binder);
        this.continuousCmdExecution ??= false;
        this.throttleTimeout ??= 0;

        // Arrays have to be cloned again in each subclass of Binder after Object.assign() since it undoes the changes
        this.copyFnArraysUpdate();
    }

    protected copyFnArraysUpdate(): void {
        super.copyFnArrays();
        this.thenFnArray = [...this.thenFnArray];
        this.thenFn = (c: C, i: D): void => {
            this.thenFnArray.forEach(fn => {
                fn(c, i);
            });
        };
        this.cancelFnArray = [...this.cancelFnArray];
        this.cancelFn = (i: D): void => {
            this.cancelFnArray.forEach(fn => {
                fn(i);
            });
        };
        this.endOrCancelFnArray = [...this.endOrCancelFnArray];
        this.endOrCancelFn = (i: D): void => {
            this.endOrCancelFnArray.forEach(fn => {
                fn(i);
            });
        };
    }

    public then(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.thenFnArray.push(fn);
        return dup;
    }

    public continuousExecution(): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.continuousCmdExecution = true;
        return dup;
    }

    public cancel(fn: (i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.cancelFnArray.push(fn);
        return dup;
    }

    public endOrCancel(fn: (i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.endOrCancelFnArray.push(fn);
        return dup;
    }

    public throttle(timeout: number): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.throttleTimeout = timeout;
        return dup;
    }

    public override on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): UpdateBinder<C, I, D> {
        return super.on(widget, ...widgets) as UpdateBinder<C, I, D>;
    }

    public override onDynamic(node: Widget<Node>): UpdateBinder<C, I, D> {
        return super.onDynamic(node) as UpdateBinder<C, I, D>;
    }

    public override first(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.first(fn) as UpdateBinder<C, I, D>;
    }

    public override when(fn: (i: D) => boolean, mode?: WhenType): UpdateBinder<C, I, D> {
        return super.when(fn, mode) as UpdateBinder<C, I, D>;
    }

    public override ifHadEffects(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifHadEffects(fn) as UpdateBinder<C, I, D>;
    }

    public override ifHadNoEffect(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifHadNoEffect(fn) as UpdateBinder<C, I, D>;
    }

    public override ifCannotExecute(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifCannotExecute(fn) as UpdateBinder<C, I, D>;
    }

    public override end(fn: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.end(fn) as UpdateBinder<C, I, D>;
    }

    public override log(...level: ReadonlyArray<LogLevel>): UpdateBinder<C, I, D> {
        return super.log(...level) as UpdateBinder<C, I, D>;
    }

    public override stopImmediatePropagation(): UpdateBinder<C, I, D> {
        return super.stopImmediatePropagation() as UpdateBinder<C, I, D>;
    }

    public override preventDefault(): UpdateBinder<C, I, D> {
        return super.preventDefault() as UpdateBinder<C, I, D>;
    }

    public override catch(fn: (ex: unknown) => void): UpdateBinder<C, I, D> {
        return super.catch(fn) as UpdateBinder<C, I, D>;
    }

    public override name(name: string): UpdateBinder<C, I, D> {
        return super.name(name) as UpdateBinder<C, I, D>;
    }

    public override usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>(fn: () => I2): UpdateBinder<C, I2, D2> {
        return super.usingInteraction(fn) as UpdateBinder<C, I2, D2>;
    }

    public override toProduce<C2 extends Command>(fn: (i: D) => C2): UpdateBinder<C2, I, D> {
        return super.toProduce(fn) as UpdateBinder<C2, I, D>;
    }

    public override toProduceAnon(fn: () => void): UpdateBinder<AnonCmd, I, D> {
        return super.toProduceAnon(fn) as UpdateBinder<AnonCmd, I, D>;
    }

    protected duplicate(): UpdateBinder<C, I, D> {
        return new UpdateBinder<C, I, D>(this.undoHistory, this.logger, this.observer, this);
    }

    public bind(): Binding<C, I, D> {
        if (this.usingFn === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.produceFn === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.usingFn(), this.undoHistory, this.logger, this.produceFn,
            [...this.widgets], [...this.dynamicNodes], [...this.logLevels],
            this.throttleTimeout, this.stopPropagation, this.prevDefault, this.firstFn, this.thenFn, [...this.whenFnArray],
            this.endFn, this.cancelFn, this.endOrCancelFn, this.hadEffectsFn,
            this.hadNoEffectFn, this.cannotExecFn, this.onErrFn, this.bindingName);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
