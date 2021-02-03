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
import {InteractionData} from "../../api/interaction/InteractionData";
import {Command} from "../../api/command/Command";
import {CmdUpdateBinder} from "../../api/binder/CmdUpdateBinder";
import {InteractionCmdUpdateBinder} from "../../api/binder/InteractionCmdUpdateBinder";
import {LogLevel} from "../../api/logging/LogLevel";
import {Binding} from "../../api/binding/Binding";
import {AnonBinding} from "../binding/AnonBinding";
import {BindingsObserver} from "../../api/binding/BindingsObserver";
import {Interaction} from "../../api/interaction/Interaction";
import {Widget} from "../../api/binder/BaseBinderBuilder";

/**
 * The base binding builder for bindings where commands can be updated while the user interaction is running.
 * @typeParam C - The type of the command to produce.
 */
export class UpdateBinder<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends Binder<C, I, D> implements CmdUpdateBinder<C>, InteractionCmdUpdateBinder<C, I, D> {

    protected updateFct?: (c: C, i: D) => void;

    protected cancelFct?: (i: D) => void;

    protected endOrCancelFct?: (i: D) => void;

    protected continuousCmdExecution: boolean;

    protected _strictStart: boolean;

    protected throttleTimeout: number;

    public constructor(observer?: BindingsObserver, throttleTimeout?: number, continuousCmdExecution?: boolean, strict?: boolean,
                       initCmd?: (c: C, i: D) => void, checkConditions?: (i: D) => boolean, cmdProducer?: (i: D) => C,
                       widgets?: ReadonlyArray<EventTarget>, dynamicNodes?: ReadonlyArray<Node>,
                       interactionSupplier?: () => I, onEnd?: (c: C, i: D) => void,
                       logLevels?: ReadonlyArray<LogLevel>, hadNoEffectFct?: (c: C, i: D) => void, hadEffectsFct?: (c: C, i: D) => void,
                       cannotExecFct?: (c: C, i: D) => void, updateFct?: (c: C, i: D) => void, cancelFct?: (i: D) => void,
                       endOrCancelFct?: (i: D) => void, stopProga?: boolean, prevent?: boolean) {
        super(observer, initCmd, checkConditions, cmdProducer, widgets, dynamicNodes, interactionSupplier, onEnd,
            logLevels, hadNoEffectFct, hadEffectsFct, cannotExecFct, stopProga, prevent);
        this.updateFct = updateFct;
        this.cancelFct = cancelFct;
        this.endOrCancelFct = endOrCancelFct;
        this.continuousCmdExecution = continuousCmdExecution ?? false;
        this._strictStart = strict ?? false;
        this.throttleTimeout = throttleTimeout ?? 0;
    }

    public then(update: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.updateFct = update;
        return dup;
    }

    public continuousExecution(): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.continuousCmdExecution = true;
        return dup;
    }

    public cancel(cancel: (i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.cancelFct = cancel;
        return dup;
    }

    public endOrCancel(endOrCancel: (i: D) => void): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.endOrCancelFct = endOrCancel;
        return dup;
    }

    public strictStart(): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup._strictStart = true;
        return dup;
    }

    public throttle(timeout: number): UpdateBinder<C, I, D> {
        const dup = this.duplicate();
        dup.throttleTimeout = timeout;
        return dup;
    }

    public on(widget: ReadonlyArray<Widget<EventTarget>> | Widget<EventTarget>, ...widgets: ReadonlyArray<Widget<EventTarget>>):
    UpdateBinder<C, I, D> {
        return super.on(widget, ...widgets) as UpdateBinder<C, I, D>;
    }

    public onDynamic(node: Widget<Node>): UpdateBinder<C, I, D> {
        return super.onDynamic(node) as UpdateBinder<C, I, D>;
    }

    public first(initCmdFct: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.first(initCmdFct) as UpdateBinder<C, I, D>;
    }

    public when(checkCmd: (i: D) => boolean): UpdateBinder<C, I, D> {
        return super.when(checkCmd) as UpdateBinder<C, I, D>;
    }

    public ifHadEffects(hadEffectFct: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifHadEffects(hadEffectFct) as UpdateBinder<C, I, D>;
    }

    public ifHadNoEffect(noEffectFct: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifHadNoEffect(noEffectFct) as UpdateBinder<C, I, D>;
    }

    public ifCannotExecute(cannotExec: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.ifCannotExecute(cannotExec) as UpdateBinder<C, I, D>;
    }

    public end(onEndFct: (c: C, i: D) => void): UpdateBinder<C, I, D> {
        return super.end(onEndFct) as UpdateBinder<C, I, D>;
    }

    public log(...level: ReadonlyArray<LogLevel>): UpdateBinder<C, I, D> {
        return super.log(...level) as UpdateBinder<C, I, D>;
    }

    public stopImmediatePropagation(): UpdateBinder<C, I, D> {
        return super.stopImmediatePropagation() as UpdateBinder<C, I, D>;
    }

    public preventDefault(): UpdateBinder<C, I, D> {
        return super.preventDefault() as UpdateBinder<C, I, D>;
    }

    public usingInteraction<I2 extends Interaction<D2>, D2 extends InteractionData>
    (interactionSupplier: () => I2): UpdateBinder<C, I2, D2> {
        return super.usingInteraction(interactionSupplier) as UpdateBinder<C, I2, D2>;
    }

    public toProduce<C2 extends Command>(cmdCreation: (i: D) => C2): UpdateBinder<C2, I, D> {
        return super.toProduce(cmdCreation) as UpdateBinder<C2, I, D>;
    }

    protected duplicate(): UpdateBinder<C, I, D> {
        return new UpdateBinder<C, I, D>(this.observer, this.throttleTimeout, this.continuousCmdExecution,
            this._strictStart, this.initCmd, this.checkConditions, this.cmdProducer,
            this.widgets, this.dynamicNodes, this.interactionSupplier, this.onEnd,
            this.logLevels, this.hadNoEffectFct, this.hadEffectsFct,
            this.cannotExecFct, this.updateFct, this.cancelFct, this.endOrCancelFct,
            this.stopPropaNow, this.prevDef);
    }

    public bind(): Binding<C, I, D> {
        if (this.interactionSupplier === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.cmdProducer === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(this.continuousCmdExecution, this.interactionSupplier(), this.cmdProducer,
            [...this.widgets], [...this.dynamicNodes], this._strictStart, [...this.logLevels],
            this.throttleTimeout, this.stopPropaNow, this.prevDef, this.initCmd, this.updateFct, this.checkConditions,
            this.onEnd, this.cancelFct, this.endOrCancelFct, this.hadEffectsFct,
            this.hadNoEffectFct, this.cannotExecFct);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
