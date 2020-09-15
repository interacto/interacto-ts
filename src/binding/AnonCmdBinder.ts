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

import {FSM} from "../fsm/FSM";
import {Binder} from "./Binder";
import {AnonBinding} from "./AnonBinding";
import {AnonCmd} from "../command/AnonCmd";
import {InteractionData} from "../interaction/InteractionData";
import {WidgetBindingImpl} from "./WidgetBindingImpl";
import {InteractionImpl} from "../interaction/InteractionImpl";
import {BindingsObserver} from "./BindingsObserver";

export class AnonCmdBinder<I extends InteractionImpl<D, FSM>, D extends InteractionData> extends Binder<AnonCmd, I, D> {
    private readonly anonymousCmd: () => void;

    public constructor(anonCmd: () => void, observer?: BindingsObserver) {
        super(observer, undefined, undefined, () => new AnonCmd(anonCmd));
        this.anonymousCmd = anonCmd;
    }

    protected duplicate(): AnonCmdBinder<I, D> {
        if (this.cmdProducer === undefined) {
            throw new Error("the cmd producer should not be undefined here");
        }

        const dup = new AnonCmdBinder<I, D>(this.anonymousCmd);
        dup.initCmd = this.initCmd;
        dup.checkConditions = this.checkConditions;
        dup.cmdProducer = this.cmdProducer;
        dup.widgets = [...this.widgets];
        dup.dynamicNodes = [...this.dynamicNodes];
        dup.interactionSupplier = this.interactionSupplier;
        dup.onEnd = this.onEnd;
        dup.logLevels = [...this.logLevels];
        dup.hadNoEffectFct = this.hadNoEffectFct;
        dup.hadEffectsFct = this.hadEffectsFct;
        dup.cannotExecFct = this.cannotExecFct;
        dup.observer = this.observer;
        dup.stopPropaNow = this.stopPropaNow;
        dup.prevDef = this.prevDef;
        return dup;
    }

    public bind(): WidgetBindingImpl<AnonCmd, I, D> {
        if (this.interactionSupplier === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.cmdProducer === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(false, this.interactionSupplier(), this.cmdProducer, [...this.widgets],
            [...this.dynamicNodes], [], false, [...this.logLevels], 0,
            this.stopPropaNow, this.prevDef, this.initCmd, undefined, this.checkConditions,
            this.onEnd, undefined, undefined, this.hadEffectsFct,
            this.hadNoEffectFct, this.cannotExecFct);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
