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

import {KeysPressed} from "../interaction/library/KeysPressed";
import {KeysData} from "../interaction/library/KeysData";
import {Binder} from "./Binder";
import {Command} from "../command/Command";
import {KeyInteractionBinder} from "./api/KeyInteractionBinder";
import {KeyInteractionCmdBinder} from "./api/KeyInteractionCmdBinder";
import {LogLevel} from "../logging/LogLevel";
import {WidgetBinding} from "./WidgetBinding";
import {AnonBinding} from "./AnonBinding";
import {BindingsObserver} from "./BindingsObserver";

/**
 * The base binding builder to create bindings between a keys pressure interaction and a given command.
 * @param <C> The type of the command to produce.
 * @param <W> The type of the widget to bind.
 * @author Arnaud Blouin
 */
export class KeysBinder<C extends Command> extends Binder<C, KeysPressed, KeysData> implements
        KeyInteractionBinder<KeysPressed, KeysData>, KeyInteractionCmdBinder<C, KeysPressed, KeysData> {

    private codes: Array<string>;

    private readonly checkCode: (i: KeysData) => boolean;

    protected constructor(observer?: BindingsObserver, initCmd?: (c: C, i?: KeysData) => void, whenPredicate?: (i: KeysData) => boolean,
                          cmdProducer?: (i?: KeysData) => C, widgets?: Array<EventTarget>, dynamicNodes?: Array<Node>,
                          onEnd?: (c: C, i?: KeysData) => void, logLevels?: Array<LogLevel>,
                          hadNoEffectFct?: (c: C, i: KeysData) => void, hadEffectsFct?: (c: C, i: KeysData) => void,
                          cannotExecFct?: (c: C, i: KeysData) => void, targetWidgets?: Array<EventTarget>,
                          keyCodes?: Array<string>, stopProga?: boolean, prevent?: boolean) {
        super(observer, initCmd, whenPredicate, cmdProducer, widgets, dynamicNodes, () => new KeysPressed(),
            onEnd, logLevels, hadNoEffectFct, hadEffectsFct, cannotExecFct, targetWidgets, stopProga, prevent);
        this.codes = keyCodes === undefined ? [] : [...keyCodes];
        this.checkCode = (i: KeysData): boolean => {
            const keys = i.getKeys();
            return (this.codes.length === 0 || this.codes.length === keys.length &&
                keys.every((v: string) => this.codes.includes(v))) &&
                (this.checkConditions === undefined || this.checkConditions(i));
        };
    }

    public with(...keyCodes: Array<string>): KeysBinder<C> {
        const dup = this.duplicate();
        dup.codes = [...keyCodes];
        return dup;
    }

    public on(...widget: Array<EventTarget>): KeysBinder<C> {
        return super.on(...widget) as KeysBinder<C>;
    }

    public onDynamic(node: Node): KeysBinder<C> {
        return super.onDynamic(node) as KeysBinder<C>;
    }

    public first(initCmdFct: (c: C, i?: KeysData) => void): KeysBinder<C> {
        return super.first(initCmdFct) as KeysBinder<C>;
    }

    public when(checkCmd: (i?: KeysData) => boolean): KeysBinder<C> {
        return super.when(checkCmd) as KeysBinder<C>;
    }

    public ifHadEffects(hadEffectFct: (c: C, i: KeysData) => void): KeysBinder<C> {
        return super.ifHadEffects(hadEffectFct) as KeysBinder<C>;
    }

    public ifHadNoEffect(noEffectFct: (c: C, i: KeysData) => void): KeysBinder<C> {
        return super.ifHadNoEffect(noEffectFct) as KeysBinder<C>;
    }

    public end(onEndFct: (c?: C, i?: KeysData) => void): KeysBinder<C> {
        return super.end(onEndFct) as KeysBinder<C>;
    }

    public log(...level: Array<LogLevel>): KeysBinder<C> {
        return super.log(...level) as KeysBinder<C>;
    }

    public stopImmediatePropagation(): KeysBinder<C> {
        return super.stopImmediatePropagation() as KeysBinder<C>;
    }

    public preventDefault(): KeysBinder<C> {
        return super.preventDefault() as KeysBinder<C>;
    }

    public toProduce<C2 extends Command>(cmdCreation: (i: KeysData) => C2): KeysBinder<C2> {
        return super.toProduce(cmdCreation) as KeysBinder<C2>;
    }


    protected duplicate(): KeysBinder<C> {
        return new KeysBinder(this.observer, this.initCmd, this.checkConditions, this.cmdProducer, [...this.widgets],
            [...this.dynamicNodes], this.onEnd, [...this.logLevels], this.hadNoEffectFct,
            this.hadEffectsFct, this.cannotExecFct, [...this.targetWidgets], [...this.codes]);
    }

    public bind(): WidgetBinding<C, KeysPressed, KeysData> {
        if (this.interactionSupplier === undefined) {
            throw new Error("The interaction supplier cannot be undefined here");
        }

        if (this.cmdProducer === undefined) {
            throw new Error("The command supplier cannot be undefined here");
        }

        const binding = new AnonBinding(false, this.interactionSupplier(), this.cmdProducer, [...this.widgets],
            [...this.dynamicNodes], [], false, [...this.logLevels], 0,
            this.stopPropaNow, this.prevDef, this.initCmd, undefined, this.checkCode,
            this.onEnd, undefined, undefined, this.hadEffectsFct,
            this.hadNoEffectFct, this.cannotExecFct);

        this.observer?.observeBinding(binding);

        return binding;
    }
}
