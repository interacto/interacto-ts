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

import {TSInteraction} from "../interaction/TSInteraction";
import {MArray} from "../util/ArrayUtil";
import {LogLevel} from "../src-core/logging/LogLevel";
import {TSWidgetBinding} from "./TSWidgetBinding";
import {AnonNodeBinding} from "./AnonNodeBinding";
import {FSM} from "../src-core/fsm/FSM";
import {CommandImpl} from "../src-core/command/CommandImpl";
import {InteractionData} from "../src-core/interaction/InteractionData";

/**
 * The base class that defines the concept of binding builder (called binder).
 * @param <W> The type of the widgets.
 * @param <A> The type of the command to produce.
 * @param <I> The type of the user interaction to bind.
 * @author Arnaud Blouin
 */
export abstract class Binder<C extends CommandImpl, I extends TSInteraction<D, FSM<Event>, {}>, D extends InteractionData,
            B extends Binder<C, I, D, B>> {

    protected initCmd: (i: D, c: C | undefined) => void;
    protected checkConditions: (i: D) => boolean;
    protected readonly widgets: MArray<EventTarget>;
    protected additionalWidgets: MArray<Node>;
    protected targetWidgets: MArray<EventTarget>;
    protected readonly cmdProducer: (i?: D) => C;
    protected readonly interaction: I;
    protected _async: boolean;
    protected onEnd: (i: D, c: C | undefined) => void;
    protected readonly logLevels: Array<LogLevel>;

    protected constructor(interaction: I, cmdProducer: (i?: D) => C) {
        this.cmdProducer = cmdProducer;
        this.interaction = interaction;
        this.widgets = new MArray();
        this._async = false;
        this.checkConditions = () => true;
        this.initCmd = () => {};
        this.onEnd = () => {};
        this.logLevels = [];
    }

    /**
     * Specifies the widgets on which the binding must operate.
     * @param widget The widgets involve in the bindings.
     * @return The builder to chain the building configuration.
     */
    public on(widget: EventTarget | MArray<EventTarget>): B {
        widget instanceof MArray ? this.widgets.push(...widget) : this.widgets.push(widget);
        return this as {} as B;
    }

    public onContent(widget: Node): B {
        if (this.additionalWidgets === undefined) {
            this.additionalWidgets = new MArray<Node>();
        }
        this.additionalWidgets.push(widget);
        return this as {} as B;
    }

    /**
     * Specifies the initialisation of the command when the interaction starts.
     * Each time the interaction starts, an instance of the command is created and configured by the given callback.
     * @param initCmdFct The callback method that initialises the command.
     * This callback takes as arguments both the command and interaction involved in the binding.
     * @return The builder to chain the building configuration.
     */
    public first(initCmdFct: (i: D, c: C) => void): B {
        this.initCmd = initCmdFct;
        return this as {} as B;
    }

    /**
     * Specifies the conditions to fulfill to initialise, update, or execute the command while the interaction is running.
     * @param checkCmd The predicate that checks whether the command can be initialised, updated, or executed.
     * This predicate takes as arguments the ongoing user interaction involved in the binding.
     * @return The builder to chain the building configuration.
     */
    public when(checkCmd: (i: D) => boolean): B {
        this.checkConditions = checkCmd;
        return this as {} as B;
    }


    /**
     * Specifies that the command will be executed in a separated threads.
     * Beware of UI modifications: UI changes must be done in the JFX UI thread.
     * @return The builder to chain the building configuration.
     */
    public async(): B {
        this._async = true;
        return this as {} as B;
    }

    /**
     * Specifies what to do end when an interaction ends (when the last event of the interaction has occurred, but just after
     * the interaction is reinitialised and the command finally executed and discarded / saved).
     * @param onEndFct The callback method to specify what to do when an interaction ends.
     * @return The builder to chain the building configuration.
     */
    public end(onEndFct: (i: D, c: C) => void): B {
        this.onEnd = onEndFct;
        return this as {} as B;
    }

    /**
     * Specifies the loggings to use.
     * Several call to 'log' can be done to log different parts:
     * log(LogLevel.INTERACTION).log(LogLevel.COMMAND)
     * @param level The logging level to use.
     * @return The builder to chain the building configuration.
     */
    public log(level: LogLevel): B {
        this.logLevels.push(level);
        return this as {} as B;
    }

    /**
     * Executes the builder to create and install the binding on the instrument.
     * @throws IllegalArgumentException On issues while creating the commands.
     * @throws InstantiationException On issues while creating the commands.
     */
    public bind(): TSWidgetBinding<C, I, D> {
        return new AnonNodeBinding<C, I, D>(false, this.interaction, this.cmdProducer, this.initCmd, (d: D) => {},
            this.checkConditions, this.onEnd, () => {}, () => {}, () => {},
            this.widgets, this.additionalWidgets, this.targetWidgets, this._async, false, this.logLevels);
    }
}
