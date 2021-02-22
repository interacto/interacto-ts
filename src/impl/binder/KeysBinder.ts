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

import {Command} from "../../api/command/Command";
import {LogLevel} from "../../api/logging/LogLevel";
import {Binding} from "../../api/binding/Binding";
import {AnonBinding} from "../binding/AnonBinding";
import {InteractionData} from "../../api/interaction/InteractionData";
import {KeysDataImpl} from "../interaction/KeysDataImpl";
import {KeyDataImpl} from "../interaction/KeyDataImpl";
import {UpdateBinder} from "./UpdateBinder";
import {KeyInteractionCmdUpdateBinder} from "../../api/binder/KeyInteractionCmdUpdateBinder";
import {Interaction} from "../../api/interaction/Interaction";
import {Widget} from "../../api/binder/BaseBinderBuilder";
import {BindingsObserver} from "../../api/binding/BindingsObserver";

/**
 * The base binding builder to create bindings between a keys pressure interaction and a given command.
 * @typeParam C - The type of the command to produce.
 */
export class KeysBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends UpdateBinder<C, I, D> implements KeyInteractionCmdUpdateBinder<C, I, D> {

    private codes: ReadonlyArray<string>;

    private readonly checkCodeFn: (i: InteractionData) => boolean;

    public constructor(observer?: BindingsObserver, binder?: Partial<KeysBinder<C, I, D>>) {
        super(observer, binder);

        Object.assign(this, binder);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.codes = this.codes === undefined ? [] : [...this.codes];
        this.checkCodeFn = (i: D): boolean => {
            let currentCodes: ReadonlyArray<string> = [];
            if (i instanceof KeysDataImpl) {
                currentCodes = i.keys.map(k => k.code);
            } else {
                if (i instanceof KeyDataImpl) {
                    currentCodes = [i.code];
                }
            }

            return (this.codes.length === 0 || this.codes.length === currentCodes.length &&
                currentCodes.every((v: string) => this.codes.includes(v))) &&
                (this.whenFn === undefined || this.whenFn(i));
        };
    }

    public with(...keyCodes: ReadonlyArray<string>): KeysBinder<C, I, D> {
        const dup = this.duplicate();
        dup.codes = [...keyCodes];
        return dup;
    }

    public on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    KeysBinder<C, I, D> {
        return super.on(widget, ...widgets) as KeysBinder<C, I, D>;
    }

    public onDynamic(node: Widget<Node>): KeysBinder<C, I, D> {
        return super.onDynamic(node) as KeysBinder<C, I, D>;
    }

    public first(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.first(fn) as KeysBinder<C, I, D>;
    }

    public when(fn: (() => boolean) | ((i: D) => boolean)): KeysBinder<C, I, D> {
        return super.when(fn) as KeysBinder<C, I, D>;
    }

    public ifHadEffects(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadEffects(fn) as KeysBinder<C, I, D>;
    }

    public ifHadNoEffect(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadNoEffect(fn) as KeysBinder<C, I, D>;
    }

    public ifCannotExecute(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifCannotExecute(fn) as KeysBinder<C, I, D>;
    }

    public end(fn: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.end(fn) as KeysBinder<C, I, D>;
    }

    public log(...level: ReadonlyArray<LogLevel>): KeysBinder<C, I, D> {
        return super.log(...level) as KeysBinder<C, I, D>;
    }

    public stopImmediatePropagation(): KeysBinder<C, I, D> {
        return super.stopImmediatePropagation() as KeysBinder<C, I, D>;
    }

    public preventDefault(): KeysBinder<C, I, D> {
        return super.preventDefault() as KeysBinder<C, I, D>;
    }

    public then(fn: ((c: C, i: D) => void) | ((c: C) => void)): KeysBinder<C, I, D> {
        return super.then(fn) as KeysBinder<C, I, D>;
    }

    public continuousExecution(): KeysBinder<C, I, D> {
        return super.continuousExecution() as KeysBinder<C, I, D>;
    }

    public strictStart(): KeysBinder<C, I, D> {
        return super.strictStart() as KeysBinder<C, I, D>;
    }

    public throttle(timeout: number): KeysBinder<C, I, D> {
        return super.throttle(timeout) as KeysBinder<C, I, D>;
    }

    public cancel(fn: (i: D) => void): KeysBinder<C, I, D> {
        return super.cancel(fn) as KeysBinder<C, I, D>;
    }

    public endOrCancel(fn: (i: D) => void): KeysBinder<C, I, D> {
        return super.endOrCancel(fn) as KeysBinder<C, I, D>;
    }

    public catch(fn: (ex: unknown) => void): KeysBinder<C, I, D> {
        return super.catch(fn) as KeysBinder<C, I, D>;
    }

    public toProduce<C2 extends Command>(fn: (i: D) => C2): KeysBinder<C2, I, D> {
        return super.toProduce(fn) as KeysBinder<C2, I, D>;
    }

    public usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>(fn: () => I2): KeysBinder<C, I2, D2> {
        return super.usingInteraction(fn) as unknown as KeysBinder<C, I2, D2>;
    }

    protected duplicate(): KeysBinder<C, I, D> {
        return new KeysBinder(this.observer, this);
    }

    public bind(): Binding<C, I, D> {
        if (this.usingFn === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.produceFn === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.usingFn(),
            this.produceFn, [...this.widgets], [...this.dynamicNodes],
            this._strictStart, [...this.logLevels], this.throttleTimeout,
            this.stopPropagation, this.prevDefault, this.firstFn, this.thenFn, this.checkCodeFn,
            this.endFn, this.cancelFn, this.endOrCancelFn, this.hadEffectsFn,
            this.hadNoEffectFn, this.cannotExecFn, this.onErrFn);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
