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
import {BindingsObserver} from "../../api/binding/BindingsObserver";
import {InteractionData} from "../../api/interaction/InteractionData";
import {KeysDataImpl} from "../interaction/library/KeysDataImpl";
import {KeyDataImpl} from "../interaction/library/KeyDataImpl";
import {UpdateBinder} from "./UpdateBinder";
import {KeyInteractionCmdUpdateBinder} from "../../api/binder/KeyInteractionCmdUpdateBinder";
import {Interaction} from "../../api/interaction/Interaction";

/**
 * The base binding builder to create bindings between a keys pressure interaction and a given command.
 * @param <C> The type of the command to produce.
 * @author Arnaud Blouin
 */
export class KeysBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends UpdateBinder<C, I, D> implements KeyInteractionCmdUpdateBinder<C, I, D> {

    private codes: Array<string>;

    private readonly checkCode: (i: InteractionData) => boolean;

    public constructor(observer?: BindingsObserver, throttleTimeout?: number, continuousCmdExecution?: boolean, strict?: boolean,
                       initCmd?: (c: C, i: D) => void, whenPredicate?: (i: D) => boolean,
                       cmdProducer?: (i: D) => C, widgets?: Array<EventTarget>, dynamicNodes?: Array<Node>,
                       interactionSupplier?: () => I, onEnd?: (c: C, i: D) => void, logLevels?: Array<LogLevel>,
                       hadNoEffectFct?: (c: C, i: D) => void, hadEffectsFct?: (c: C, i: D) => void,
                       cannotExecFct?: (c: C, i: D) => void, updateFct?: (c: C, i: D) => void, cancelFct?: (i: D) => void,
                       endOrCancelFct?: (i: D) => void, keyCodes?: Array<string>, stopProga?: boolean, prevent?: boolean) {
        super(observer, throttleTimeout, continuousCmdExecution, strict, initCmd, whenPredicate, cmdProducer, widgets,
            dynamicNodes, interactionSupplier, onEnd, logLevels, hadNoEffectFct, hadEffectsFct, cannotExecFct,
            updateFct, cancelFct, endOrCancelFct, stopProga, prevent);
        this.codes = keyCodes === undefined ? [] : [...keyCodes];
        this.checkCode = (i: D): boolean => {
            if (i instanceof KeysDataImpl) {
                const keys = i.getKeys();
                return (this.codes.length === 0 || this.codes.length === keys.length &&
                    keys.every((v: string) => this.codes.includes(v))) &&
                    (this.checkConditions === undefined || this.checkConditions(i));
            }
            if (i instanceof KeyDataImpl) {
                const key = (i as KeyDataImpl).getKey();
                return (this.codes.length === 0 || this.codes.length === 1 && key === this.codes[0]) &&
                    (this.checkConditions === undefined || this.checkConditions(i));
            }
            return false;
        };
    }

    public with(...keyCodes: Array<string>): KeysBinder<C, I, D> {
        const dup = this.duplicate();
        dup.codes = [...keyCodes];
        return dup;
    }

    public on(...widget: Array<EventTarget>): KeysBinder<C, I, D> {
        return super.on(...widget) as KeysBinder<C, I, D>;
    }

    public onDynamic(node: Node): KeysBinder<C, I, D> {
        return super.onDynamic(node) as KeysBinder<C, I, D>;
    }

    public first(initCmdFct: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.first(initCmdFct) as KeysBinder<C, I, D>;
    }

    public when(checkCmd: ((i: D) => boolean) | (() => boolean)): KeysBinder<C, I, D> {
        return super.when(checkCmd) as KeysBinder<C, I, D>;
    }

    public ifHadEffects(hadEffectFct: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadEffects(hadEffectFct) as KeysBinder<C, I, D>;
    }

    public ifHadNoEffect(noEffectFct: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifHadNoEffect(noEffectFct) as KeysBinder<C, I, D>;
    }

    public ifCannotExecute(cannotExec: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.ifCannotExecute(cannotExec) as KeysBinder<C, I, D>;
    }

    public end(onEndFct: (c: C, i: D) => void): KeysBinder<C, I, D> {
        return super.end(onEndFct) as KeysBinder<C, I, D>;
    }

    public log(...level: Array<LogLevel>): KeysBinder<C, I, D> {
        return super.log(...level) as KeysBinder<C, I, D>;
    }

    public stopImmediatePropagation(): KeysBinder<C, I, D> {
        return super.stopImmediatePropagation() as KeysBinder<C, I, D>;
    }

    public preventDefault(): KeysBinder<C, I, D> {
        return super.preventDefault() as KeysBinder<C, I, D>;
    }

    public then(update: ((c: C, i: D) => void) | ((c: C) => void)): KeysBinder<C, I, D> {
        return super.then(update) as KeysBinder<C, I, D>;
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

    public cancel(cancel: (i: D) => void): KeysBinder<C, I, D> {
        return super.cancel(cancel) as KeysBinder<C, I, D>;
    }

    public endOrCancel(endOrCancel: (i: D) => void): KeysBinder<C, I, D> {
        return super.endOrCancel(endOrCancel) as KeysBinder<C, I, D>;
    }

    public toProduce<C2 extends Command>(cmdCreation: (i: D) => C2): KeysBinder<C2, I, D> {
        return super.toProduce(cmdCreation) as KeysBinder<C2, I, D>;
    }

    public usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>
    (interactionSupplier: () => I2): KeysBinder<C, I2, D2> {
        return super.usingInteraction(interactionSupplier) as unknown as KeysBinder<C, I2, D2>;
    }

    protected duplicate(): KeysBinder<C, I, D> {
        return new KeysBinder(this.observer, this.throttleTimeout, this.continuousCmdExecution,
            this._strictStart, this.initCmd, this.checkConditions, this.cmdProducer,
            this.widgets, this.dynamicNodes, this.interactionSupplier, this.onEnd,
            this.logLevels, this.hadNoEffectFct, this.hadEffectsFct,
            this.cannotExecFct, this.updateFct, this.cancelFct, this.endOrCancelFct,
            [...this.codes], this.stopPropaNow, this.prevDef);
    }

    public bind(): Binding<C, I, D> {
        if (this.interactionSupplier === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.cmdProducer === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.interactionSupplier(),
            this.cmdProducer, [...this.widgets], [...this.dynamicNodes],
            this._strictStart, [...this.logLevels], this.throttleTimeout,
            this.stopPropaNow, this.prevDef, this.initCmd, this.updateFct, this.checkCode,
            this.onEnd, this.cancelFct, this.endOrCancelFct, this.hadEffectsFct,
            this.hadNoEffectFct, this.cannotExecFct);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
