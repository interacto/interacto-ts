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

import {UpdateBinder} from "./UpdateBinder";
import {AnonBinding} from "../binding/AnonBinding";
import {KeyDataImpl} from "../interaction/KeyDataImpl";
import {KeysDataImpl} from "../interaction/KeysDataImpl";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import type {KeyInteractionCmdUpdateBinder} from "../../api/binder/KeyInteractionCmdUpdateBinder";
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
 * The base binding builder to create bindings between a keys pressure interaction and a given command.
 * @typeParam C - The type of the command to produce.
 * @category Binding
 */
// eslint-disable-next-line no-use-before-define
export class KeysBinder<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
    extends UpdateBinder<C, I, A, D> implements KeyInteractionCmdUpdateBinder<C, I, A, D> {

    private keysOrCodes: ReadonlyArray<string>;

    private isCode: boolean;

    // private readonly checkCodeFn: (i: InteractionData) => boolean;

    public constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver,
                       binder?: Partial<KeysBinder<C, I, A, D>>, acc?: A) {
        super(undoHistory, logger, observer, binder, acc);

        this.isCode = false;
        this.keysOrCodes = [];

        Object.assign(this, binder);

        // Arrays have to be cloned again in each subclass of Binder after Object.assign() since it undoes the changes
        this.copyFnArraysUpdate();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.keysOrCodes = this.keysOrCodes === undefined ? [] : Array.from(this.keysOrCodes);
        this.completeWhenWithKeysPredicates();
    }

    private completeWhenWithKeysPredicates(): void {
        const checkCodeFn = (i: D): boolean => {
            let currentKeys: ReadonlyArray<string> = [];

            if (this.isCode) {
                if (i instanceof KeysDataImpl) {
                    currentKeys = i.keys.map(key => key.code);
                } else {
                    if (i instanceof KeyDataImpl) {
                        currentKeys = [i.code];
                    }
                }
            } else {
                if (i instanceof KeysDataImpl) {
                    currentKeys = i.keys.map(key => key.key);
                } else {
                    if (i instanceof KeyDataImpl) {
                        currentKeys = [i.key];
                    }
                }
            }

            return (this.keysOrCodes.length === 0 || this.keysOrCodes.length === currentKeys.length &&
              currentKeys.every((key: string) => this.keysOrCodes.includes(key)));
        };

        this.whenFnArray.push({
            "fn": checkCodeFn,
            "type": "nonStrict"
        });
    }

    public with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeysBinder<C, I, A, D> {
        const dup = this.duplicate();
        dup.keysOrCodes = Array.from(keysOrCodes);
        dup.isCode = isCode;
        return dup;
    }

    public override on<W>(widget: ReadonlyArray<Widget<W>> | Widget<W>, ...widgets: ReadonlyArray<Widget<W>>): KeysBinder<C, I, A, D> {
        return super.on(widget, ...widgets) as KeysBinder<C, I, A, D>;
    }

    public override onDynamic(node: Widget<Node>): KeysBinder<C, I, A, D> {
        return super.onDynamic(node) as KeysBinder<C, I, A, D>;
    }

    public override first(fn: (c: C, i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.first(fn) as KeysBinder<C, I, A, D>;
    }

    public override when(fn: (() => boolean) | ((i: D, acc: Readonly<A>) => boolean), mode?: WhenType): KeysBinder<C, I, A, D> {
        return super.when(fn, mode) as KeysBinder<C, I, A, D>;
    }

    public override ifHadEffects(fn: (c: C, i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.ifHadEffects(fn) as KeysBinder<C, I, A, D>;
    }

    public override ifHadNoEffect(fn: (c: C, i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.ifHadNoEffect(fn) as KeysBinder<C, I, A, D>;
    }

    public override ifCannotExecute(fn: (c: C, i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.ifCannotExecute(fn) as KeysBinder<C, I, A, D>;
    }

    public override end(fn: (c: C, i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.end(fn) as KeysBinder<C, I, A, D>;
    }

    public override log(...level: ReadonlyArray<LogLevel>): KeysBinder<C, I, A, D> {
        return super.log(...level) as KeysBinder<C, I, A, D>;
    }

    public override stopImmediatePropagation(): KeysBinder<C, I, A, D> {
        return super.stopImmediatePropagation() as KeysBinder<C, I, A, D>;
    }

    public override preventDefault(): KeysBinder<C, I, A, D> {
        return super.preventDefault() as KeysBinder<C, I, A, D>;
    }

    public override then(fn: ((c: C, i: D, acc: A) => void) | ((c: C) => void)): KeysBinder<C, I, A, D> {
        return super.then(fn) as KeysBinder<C, I, A, D>;
    }

    public override continuousExecution(): KeysBinder<C, I, A, D> {
        return super.continuousExecution() as KeysBinder<C, I, A, D>;
    }

    public override throttle(timeout: number): KeysBinder<C, I, A, D> {
        return super.throttle(timeout) as KeysBinder<C, I, A, D>;
    }

    public override cancel(fn: (i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.cancel(fn) as KeysBinder<C, I, A, D>;
    }

    public override endOrCancel(fn: (i: D, acc: A) => void): KeysBinder<C, I, A, D> {
        return super.endOrCancel(fn) as KeysBinder<C, I, A, D>;
    }

    public override catch(fn: (ex: unknown) => void): KeysBinder<C, I, A, D> {
        return super.catch(fn) as KeysBinder<C, I, A, D>;
    }

    public override name(name: string): KeysBinder<C, I, A, D> {
        return super.name(name) as KeysBinder<C, I, A, D>;
    }

    public override configureRules(ruleName: RuleName, severity: Severity): KeysBinder<C, I, A, D> {
        return super.configureRules(ruleName, severity) as KeysBinder<C, I, A, D>;
    }

    public override toProduce<C2 extends Command>(fn: (i: D) => C2): KeysBinder<C2, I, A, D> {
        return super.toProduce(fn) as KeysBinder<C2, I, A, D>;
    }

    public override toProduceAnon(fn: () => void): KeysBinder<Command, I, A, D> {
        return super.toProduceAnon(fn) as KeysBinder<Command, I, A, D>;
    }

    // eslint-disable-next-line no-use-before-define
    public override usingInteraction<I2 extends Interaction<D2>, A2, D2 extends object = InteractionDataType<I2>>
    (fn: () => I2): KeysBinder<C, I2, A2, D2> {
        return super.usingInteraction(fn as unknown as () => Interaction<InteractionDataType<I2>>) as unknown as KeysBinder<C, I2, A2, D2>;
    }

    protected override duplicate(): KeysBinder<C, I, A, D> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, this);
    }

    public override bind(): Binding<C, I, A, D> {
        if (this.usingFn === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.produceFn === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.usingFn(), this.undoHistory,
            this.logger, this.produceFn, Array.from(this.widgets), Array.from(this.dynamicNodes),
            Array.from(this.logLevels), this.throttleTimeout, this.stopPropagation, this.prevDefault,
            new Map(this.linterRules), this.firstFn, this.thenFn, Array.from(this.whenFnArray),
            this.endFn, this.cancelFn, this.endOrCancelFn, this.hadEffectsFn,
            this.hadNoEffectFn, this.cannotExecFn, this.onErrFn, this.bindingName, this.accInit);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
