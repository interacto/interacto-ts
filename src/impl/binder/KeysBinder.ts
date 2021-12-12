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

import type {Command} from "../../api/command/Command";
import type {LogLevel} from "../../api/logging/LogLevel";
import type {Binding} from "../../api/binding/Binding";
import {AnonBinding} from "../binding/AnonBinding";
import type {InteractionData} from "../../api/interaction/InteractionData";
import {KeysDataImpl} from "../interaction/KeysDataImpl";
import {KeyDataImpl} from "../interaction/KeyDataImpl";
import {UpdateBinder} from "./UpdateBinder";
import type {KeyInteractionCmdUpdateBinder} from "../../api/binder/KeyInteractionCmdUpdateBinder";
import type {Interaction} from "../../api/interaction/Interaction";
import type {Widget} from "../../api/binder/BaseBinderBuilder";
import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {Logger} from "../../api/logging/Logger";
import type {AnonCmd} from "../command/AnonCmd";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";

/**
 * The base binding builder to create bindings between a keys pressure interaction and a given command.
 * @typeParam C - The type of the command to produce.
 */
export class KeysBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends UpdateBinder<C, I, D> implements KeyInteractionCmdUpdateBinder<C, I, D> {

    private keysOrCodes: ReadonlyArray<string>;

    private isCode: boolean;

    private readonly checkCodeFn: (i: InteractionData) => boolean;

    public constructor(undoHistory: UndoHistoryBase, logger: Logger, observer?: BindingsObserver, binder?: Partial<KeysBinder<C, I, D>>) {
        super(undoHistory, logger, observer, binder);

        Object.assign(this, binder);

        // Arrays have to be cloned again in each subclass of Binder after Object.assign() since it undoes the changes
        this.copyFnArraysUpdate();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.keysOrCodes = this.keysOrCodes === undefined ? [] : [...this.keysOrCodes];
        this.checkCodeFn = (i: D): boolean => {
            let currentKeys: ReadonlyArray<string> = [];

            if (this.isCode) {
                if (i instanceof KeysDataImpl) {
                    currentKeys = i.keys.map(k => k.code);
                } else {
                    if (i instanceof KeyDataImpl) {
                        currentKeys = [i.code];
                    }
                }
            } else {
                if (i instanceof KeysDataImpl) {
                    currentKeys = i.keys.map(k => k.key);
                } else {
                    if (i instanceof KeyDataImpl) {
                        currentKeys = [i.key];
                    }
                }
            }

            return (this.keysOrCodes.length === 0 || this.keysOrCodes.length === currentKeys.length &&
                    currentKeys.every((v: string) => this.keysOrCodes.includes(v))) &&
                (this.whenFn === undefined || this.whenFn(i));
        };
    }

    public with(isCode: boolean, ...keysOrCodes: ReadonlyArray<string>): KeysBinder<C, I, D> {
        const dup = this.duplicate();
        dup.keysOrCodes = [...keysOrCodes];
        dup.isCode = isCode;
        return dup;
    }

    public override on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeysBinder<C, I, D> {
        return super.on(widget, ...widgets) as KeysBinder<C, I, D>;
    }

    public override onDynamic(node: Widget<Node>): KeysBinder<C, I, D> {
        return super.onDynamic(node) as KeysBinder<C, I, D>;
    }

    public override first(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.first(fn) as KeysBinder<C, I, D>;
    }

    public override when(fn: (() => boolean) | ((i: D) => boolean)): KeysBinder<C, I, D> {
        return super.when(fn) as KeysBinder<C, I, D>;
    }

    public override ifHadEffects(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadEffects(fn) as KeysBinder<C, I, D>;
    }

    public override ifHadNoEffect(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadNoEffect(fn) as KeysBinder<C, I, D>;
    }

    public override ifCannotExecute(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifCannotExecute(fn) as KeysBinder<C, I, D>;
    }

    public override end(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.end(fn) as KeysBinder<C, I, D>;
    }

    public override log(...level: ReadonlyArray<LogLevel>): KeysBinder<C, I, D> {
        return super.log(...level) as KeysBinder<C, I, D>;
    }

    public override stopImmediatePropagation(): KeysBinder<C, I, D> {
        return super.stopImmediatePropagation() as KeysBinder<C, I, D>;
    }

    public override preventDefault(): KeysBinder<C, I, D> {
        return super.preventDefault() as KeysBinder<C, I, D>;
    }

    public override then(fn: ((c: C, i: D) => void) | ((c: C) => void)): KeysBinder<C, I, D> {
        return super.then(fn) as KeysBinder<C, I, D>;
    }

    public override continuousExecution(): KeysBinder<C, I, D> {
        return super.continuousExecution() as KeysBinder<C, I, D>;
    }

    public override strictStart(): KeysBinder<C, I, D> {
        return super.strictStart() as KeysBinder<C, I, D>;
    }

    public override throttle(timeout: number): KeysBinder<C, I, D> {
        return super.throttle(timeout) as KeysBinder<C, I, D>;
    }

    public override cancel(fn: (i: D) => void): KeysBinder<C, I, D> {
        return super.cancel(fn) as KeysBinder<C, I, D>;
    }

    public override endOrCancel(fn: (i: D) => void): KeysBinder<C, I, D> {
        return super.endOrCancel(fn) as KeysBinder<C, I, D>;
    }

    public override catch(fn: (ex: unknown) => void): KeysBinder<C, I, D> {
        return super.catch(fn) as KeysBinder<C, I, D>;
    }

    public override name(name: string): KeysBinder<C, I, D> {
        return super.name(name) as KeysBinder<C, I, D>;
    }

    public override toProduce<C2 extends Command>(fn: (i: D) => C2): KeysBinder<C2, I, D> {
        return super.toProduce(fn) as KeysBinder<C2, I, D>;
    }

    public override toProduceAnon(fn: () => void): KeysBinder<AnonCmd, I, D> {
        return super.toProduceAnon(fn) as KeysBinder<AnonCmd, I, D>;
    }

    public override usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>(fn: () => I2): KeysBinder<C, I2, D2> {
        return super.usingInteraction(fn) as unknown as KeysBinder<C, I2, D2>;
    }

    protected override duplicate(): KeysBinder<C, I, D> {
        return new KeysBinder(this.undoHistory, this.logger, this.observer, this);
    }

    public override bind(): Binding<C, I, D> {
        if (this.usingFn === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.produceFn === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.usingFn(), this.undoHistory,
            this.logger, this.produceFn, [...this.widgets], [...this.dynamicNodes],
            this._strictStart, [...this.logLevels], this.throttleTimeout,
            this.stopPropagation, this.prevDefault, this.firstFn, this.thenFn, this.checkCodeFn,
            this.endFn, this.cancelFn, this.endOrCancelFn, this.hadEffectsFn,
            this.hadNoEffectFn, this.cannotExecFn, this.onErrFn, this.bindingName);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
