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

import {TSWidgetBinding} from "./TSWidgetBinding";
import {TSInteraction} from "../interaction/TSInteraction";
import {FSM} from "../src-core/fsm/FSM";
import {CommandImpl} from "../src-core/command/CommandImpl";
import {InteractionData} from "../src-core/interaction/InteractionData";
import {MArray} from "../util/ArrayUtil";
import {LogLevel} from "../src-core/logging/LogLevel";

export class AnonNodeBinding<C extends CommandImpl, I extends TSInteraction<D, FSM<Event>, {}>, D extends InteractionData>
    extends TSWidgetBinding<C, I, D> {

    private readonly execInitCmd: (i: D, c: C | undefined) => void;
    private readonly execUpdateCmd: (i: D, c: C | undefined) => void;
    private readonly checkInteraction: (i: D) => boolean;
    private readonly cancelFct: (i: D, c: C | undefined) => void;
    private readonly endOrCancelFct: (i: D, c: C | undefined) => void;
    private readonly feedbackFct: () => void;
    private readonly onEnd: (i: D, c: C | undefined) => void;
    private readonly strictStart: boolean;

    private currentCmd: C | undefined;


    /**
     * Creates a widget binding. This constructor must initialise the interaction. The binding is (de-)activated if the given
     * instrument is (de-)activated.
     * @param exec Specifies if the command must be execute or update on each evolution of the interaction.
     * @param cmdProducer The type of the command that will be created. Used to instantiate the command by reflexivity.
     * The class must be public and must have a constructor with no parameter.
     * @param interaction The user interaction of the binding.
     * @param check
     * @param onEndFct Function execute at the end of the interaction, before the command execution
     * @param cancel Function execute when the interaction is cancel
     * @param endOrCancel Function execute when the interaction is either canceled or is ending
     * @param feedback
     * @param widgets The widgets used by the binding. Cannot be null.
     * @param initCmdFct The function that initialises the command to execute. Cannot be null.
     * @param updateCmdFct The function that updates the command. Can be null.
     * @param additionalWidgets Nodes use give by the onContent() routine.
     * @param targetWidgets Nodes give by the to() routine.
     * @param asyncExec
     * @param strict
     * @param loggers Log levels.
     * @throws IllegalArgumentException If the given interaction or instrument is null.
     */
    public constructor(exec: boolean, interaction: I, cmdProducer: (d?: D) => C, initCmdFct: (i: D, c: C | undefined) => void,
                       updateCmdFct: (i: D, c: C | undefined) => void, check: (i: D) => boolean,
                       onEndFct: (i: D, c: C | undefined) => void, cancel: (i: D, c: C | undefined) => void,
                       endOrCancel: (i: D, c: C | undefined) => void, feedback: () => void, widgets: Array<EventTarget>,
                       additionalWidgets: Array<Node>, targetWidgets: MArray<EventTarget>,
                       // List<ObservableList<? extends Node>> additionalWidgets, HelpAnimation animation, help : boolean
                       asyncExec: boolean, strict: boolean, loggers: Array<LogLevel>) {
        super(exec, interaction, cmdProducer, widgets);
        this.configureLoggers(loggers);
        this.execInitCmd = initCmdFct;
        this.execUpdateCmd = updateCmdFct;
        this.cancelFct = cancel;
        this.endOrCancelFct = endOrCancel;
        this.feedbackFct = feedback;
        this.checkInteraction = check;
        this.async = asyncExec;
        this.onEnd = onEndFct;
        this.strictStart = strict;

        this.currentCmd = undefined;

        if (additionalWidgets !== undefined) {
            const noUndefinedWidget = additionalWidgets.filter(value => value !== undefined);
            noUndefinedWidget.forEach(node => interaction.registerToObservableList(node));
            interaction.addAdditionalNodes(noUndefinedWidget);
        }
        if (targetWidgets !== undefined) {
            interaction.registerToTargetNodes(targetWidgets);
        }
    }

    public map(): C {
        this.cmdProducer === undefined ? this.currentCmd = super.map() : this.currentCmd = this.cmdProducer(this.interaction.getData());
        return this.currentCmd;
    }

    private configureLoggers(loggers: Array<LogLevel>): void {
        if (loggers.length !== 0) {
            this.setLogCmd(loggers.includes(LogLevel.COMMAND.valueOf()));
            this.setLogBinding(loggers.includes(LogLevel.BINDING.valueOf()));
            this.interaction.log(loggers.includes(LogLevel.INTERACTION.valueOf()));
        }
    }

    public isStrictStart(): boolean {
        return this.strictStart;
    }

    public first(): void {
        this.execInitCmd(this.getInteraction().getData(), this.getCommand());
    }

    public then(): void {
        this.execUpdateCmd(this.getInteraction().getData(), this.getCommand());
    }

    public when(): boolean {
        // if(loggerBinding !== undefined) {
        //     loggerBinding.log(Level.INFO, "Checking condition: " + ok);
        // }
        return this.checkInteraction(this.getInteraction().getData());
    }

    public fsmCancels(): void {
        if (this.endOrCancelFct !== undefined && this.currentCmd !== undefined) {
            this.endOrCancelFct(this.interaction.getData(), this.currentCmd);
        }
        if (this.cancelFct !== undefined && this.currentCmd !== undefined) {
            this.cancelFct(this.interaction.getData(), this.currentCmd);
        }
        super.fsmCancels();
        this.currentCmd = undefined;
    }

    public feedback(): void {
        // if(loggerBinding !== undefined) {
        //     loggerBinding.log(Level.INFO, "Feedback");
        // }
        this.feedbackFct();
    }

    public fsmStops(): void {
        super.fsmStops();
        if (this.endOrCancelFct !== undefined && this.currentCmd !== undefined) {
            this.endOrCancelFct(this.getInteraction().getData(), this.currentCmd);
        }
        if (this.onEnd !== undefined && this.currentCmd !== undefined) {
            this.onEnd(this.getInteraction().getData(), this.currentCmd);
        }
        this.currentCmd = undefined;
    }
}
