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

import {InteractionImpl} from "../interaction/InteractionImpl";
import {WidgetBinding} from "./WidgetBinding";
import {CancelFSMException} from "../fsm/CancelFSMException";
import {isUndoableType} from "../undo/Undoable";
import {catBinder, catCommand} from "../logging/ConfigLog";
import {FSM} from "../fsm/FSM";
import {CommandImpl} from "../command/CommandImpl";
import {MustBeUndoableCmdException} from "./MustBeUndoableCmdException";
import {Command, RegistrationPolicy} from "../command/Command";
import {CommandsRegistry} from "../command/CommandsRegistry";
import {InteractionData} from "../interaction/InteractionData";

/**
 * Creates a widget binding. This constructor must initialise the interaction. The widget binding is (de-)activated if the given
 * instrument is (de-)activated.
 * @param {*} ins The instrument that contains the widget binding.
 * @param {boolean} exec Specifies if the command must be execute or update on each evolution of the interaction.
 * @param {*} actionClass The type of the command that will be created. Used to instantiate the command by reflexivity.
 * The class must be public and must have a constructor with no parameter.
 * @param {InteractionImpl} interaction The user interaction of the binding.
 * @throws IllegalArgumentException If the given interaction or instrument is null.
 * @class
 * @author Arnaud BLOUIN
 */
export abstract class WidgetBindingImpl<C extends CommandImpl, I extends InteractionImpl<D, {}, FSM<{}>>, D extends InteractionData>
            implements WidgetBinding {

    protected asLogBinding: boolean;

    protected asLogCmd: boolean;

    /**
     * The source interaction.
     */
    protected readonly interaction: I;

    /**
     * The current action in progress.
     */
    protected cmd: C | undefined;

    /**
     * Specifies if the command must be execute or update * on each evolution of the interaction.
     */
    protected execute: boolean;

    /**
     * Defines whether the command must be executed in a specific thread.
     */
    protected async: boolean;

    /**
     * The command class to instantiate.
     */
    protected readonly cmdProducer: (i?: D) => C;

    protected constructor(exec: boolean, interaction: I, cmdProducer: (i?: D) => C) {
        this.asLogBinding = false;
        this.asLogCmd = false;

        this.execute = false;
        this.async = false;
        this.cmdProducer = cmdProducer;
        this.interaction = interaction;
        this.cmd = undefined;
        // this.instrument = ins;
        this.execute = exec;
        this.interaction.getFsm().addHandler(this);

        this.setActivated(true);
    }

    /**
     * Whether the command must be executed in a specific thread.
     * @return {boolean} True: the command will be executed asynchronously.
     */
    public isAsync(): boolean {
        return this.async;
    }

    /**
     * Sets wether the command must be executed in a specific thread.
     * @param {boolean} asyncCmd True: the command will be executed asynchronously.
     */
    public setAsync(asyncCmd: boolean) {
        this.async = asyncCmd;
    }

    /**
     *
     */
    public clearEvents(): void {
        this.interaction.fullReinit();
    }

    /**
     * creates the command of the widget binding. If the attribute 'cmd' is not null, nothing will be done.
     * @return {CommandImpl} The created command.
     */
    protected map(): C {
        return this.cmdProducer(this.interaction.getData());
    }

    public abstract first(): void;

    public then(): void {
    }

    /**
     * @return {boolean}
     */
    public abstract when(): boolean;

    public getInteraction(): I {
        return this.interaction;
    }

    /**
     * @return {CommandImpl}
     */
    public getCommand(): C | undefined {
        return this.cmd;
    }

    /**
     * @return {boolean}
     */
    public isActivated(): boolean {
        return true; //this.instrument.isActivated();
    }

    /**
     * @return {boolean}
     */
    public isRunning(): boolean {
        return this.interaction.isRunning();
    }

    /**
     *
     * @return {boolean}
     */
    public isStrictStart(): boolean {
        return false;
    }

    protected unbindCmdAttributes(): void {
        if (this.cmd !== undefined) {
            this.unbindCmdAttributesClass(this.cmd.constructor);
            if (this.asLogCmd) {
                catCommand.info(`Command unbound: ${this.cmd.constructor.name}`);
            }
        }
    }

    private unbindCmdAttributesClass(clazz: Object): void {
        //FIXME
        // java.util.Arrays.stream<any>(clazz.getDeclaredFields()).filter((field) =>
        // field.isAnnotationPresent("AutoUnbind") && "javafx.beans.property.Property".isAssignableFrom(field.getType())).
        // forEach((field) => {
        //     try {
        //         let access : boolean = field.isAccessible();
        //         let o : any = /* get */this.cmd[field.name];
        //         if(o instanceof Property) {
        //             (<javafx.beans.property.Property<any>><any>o).unbind();
        //         }
        //     } catch(ex) {
        //         console.error(ex.message, ex);
        //     };
        // });
        // let superClass : any = clazz.getSuperclass();
        // if(superClass !== undefined && superClass !== ActionImpl && ActionImpl.isAssignableFrom(superClass)) {
        //     this.unbindActionAttributesClass(<any>superClass);
        // }
    }

    /**
     *
     */
    public fsmCancels(): void {
        if (this.cmd !== undefined) {
            if (this.asLogBinding) {
                catBinder.info("Binding cancelled");
            }
            this.cmd.cancel();
            if (this.asLogCmd) {
                catCommand.info(`Command ${this.cmd.constructor.name} cancelled`);
            }
            this.unbindCmdAttributes();
            // this.instrument.onCmdCancelled(this.cmd);
            if (this.isExecute() && this.cmd.hadEffect()) {
                if (isUndoableType(this.cmd)) {
                    this.cmd.undo();
                    if (this.asLogCmd) {
                        catCommand.info(`Command ${this.cmd.constructor.name} undone`);
                    }
                } else {
                    throw new MustBeUndoableCmdException(this.cmd);
                }
            }
            this.cmd = undefined;
            // this.instrument.interimFeedback();
        }
    }

    /**
     *
     */
    public fsmStarts(): void {
        const ok: boolean = this.cmd === undefined && this.isActivated() && this.when();
        if (this.asLogBinding) {
            catBinder.info(`Starting binding: ${ok}`);
        }
        if (ok) {
            this.cmd = this.map();
            this.first();
            if (this.asLogCmd) {
                catCommand.info(`Command created and init: ${this.cmd.constructor.name}`);
            }
            this.feedback();
        } else {
            if (this.isStrictStart()) {
                if (this.asLogBinding) {
                    catBinder.info(`Cancelling starting interaction: ${this.interaction.constructor.name}`);
                }
                throw new CancelFSMException();
            }
        }
    }

    /**
     *
     */
    public fsmStops(): void {
        const ok: boolean = this.when();
        if (this.asLogBinding) {
            catBinder.info(`Binding stops with condition: ${ok}`);
        }
        if (ok) {
            if (this.cmd === undefined) {
                this.cmd = this.map();
                this.first();
                if (this.asLogCmd) {
                    catCommand.info(`Command created and init: ${this.cmd.constructor.name}`);
                }
            }
            if (!this.execute) {
                this.then();
                if (this.asLogCmd) {
                    catCommand.info(`Command ${this.cmd.constructor.name} is updated`);
                }
            }
            this.executeCmd(this.cmd, this.async);
            this.unbindCmdAttributes();
            this.cmd = undefined;
            // this.instrument.interimFeedback();
        } else {
            if (this.cmd !== undefined) {
                if (this.asLogCmd) {
                    catCommand.info(`Cancelling the command: ${this.cmd.constructor.name}`);
                }
                this.cmd.cancel();
                this.unbindCmdAttributes();
                // this.instrument.onCmdCancelled(this.cmd);
                this.cmd = undefined;
                // this.instrument.interimFeedback();
            }
        }
    }

    private executeCmd(cmd: Command, async: boolean): void {
        if (async) {
            this.executeCmdAsync(cmd);
        } else {
            this.afterCmdExecuted(cmd, cmd.doIt());
        }
    }

    protected abstract executeCmdAsync(cmd: Command): void;

    protected afterCmdExecuted(cmd: Command, ok: boolean): void {
        if (this.asLogCmd) {
            catCommand.info(`Command execution did it: ${ok}`);
        }
        if (ok) {
            // this.instrument.onCmdExecuted(cmd);
            cmd.done();
            // this.instrument.onCmdDone(cmd);
        }
        const hadEffect: boolean = cmd.hadEffect();
        if (this.asLogCmd) {
            catCommand.info(`Command execution had effect: ${hadEffect}`);
        }
        if (hadEffect) {
            if (cmd.getRegistrationPolicy() !== RegistrationPolicy.NONE) {
                CommandsRegistry.INSTANCE.addCommand(cmd); //, this.instrument
                // this.instrument.onCmdAdded(cmd);
            } else {
                CommandsRegistry.INSTANCE.unregisterCmd(cmd);
            }
            cmd.followingCmds().forEach(cmdFollow => this.executeCmd(cmdFollow, false));
        }
    }

    public fsmUpdates(): void {
        const ok: boolean = this.when();
        if (this.asLogBinding) {
            catBinder.info(`Binding updates with condition: ${ok}`);
        }
        if (ok) {
            if (this.cmd === undefined) {
                this.cmd = this.map();
                if (this.asLogCmd) {
                    catCommand.info(`Creation of command : ${this.cmd.constructor.name}`);
                }
                this.first();
            }
            if (this.asLogCmd) {
                catCommand.info(`Command ${this.cmd.constructor.name} updated`);
            }
            this.then();
            if (this.execute && this.cmd.canDo()) {
                this.cmd.doIt();
                if (this.asLogCmd) {
                    catCommand.info(`Command ${this.cmd.constructor.name} executed`);
                }
                // this.instrument.onCmdExecuted(this.cmd);
            }
            this.feedback();
        }
    }

    public uninstallBinding(): void {
        this.setActivated(false);
        this.asLogBinding = false;
        this.asLogCmd = false;
    }

    /**
     *
     * @return {boolean}
     */
    public isExecute(): boolean {
        return this.execute;
    }

    /**
     *
     */
    public feedback(): void {
    }

    /**
     *
     * @param {boolean} active
     */
    public setActivated(active: boolean): void {
        if (this.asLogBinding) {
            catBinder.info(`Binding Activated: ${active}`);
        }
        this.interaction.setActivated(active);
    }

    public setLogBinding(log: boolean) {
        this.asLogBinding = log;
    }

    public setLogCmd(log: boolean) {
        this.asLogCmd = log;
    }

}
