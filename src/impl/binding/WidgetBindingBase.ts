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

import {Observable, Subject} from "rxjs";
import {CmdStatus, Command, RegistrationPolicy} from "../../api/command/Command";
import {CommandsRegistry} from "../command/CommandsRegistry";
import {ErrorCatcher} from "../error/ErrorCatcher";
import {CancelFSMException} from "../fsm/CancelFSMException";
import {FSM} from "../../api/fsm/FSM";
import {InteractionData} from "../../api/interaction/InteractionData";
import {catBinder, catCommand} from "../../api/logging/ConfigLog";
import {isUndoableType} from "../../api/undo/Undoable";
import {MustBeUndoableCmdException} from "../../api/binding/MustBeUndoableCmdException";
import {WidgetBinding} from "../../api/binding/WidgetBinding";
import {Interaction} from "../../api/interaction/Interaction";

/**
 * The base class to do widget bindings, i.e. bindings between user interactions and (undoable) commands.
 * @param <C> The type of the command that will produce this widget binding.
 * @param <I> The type of the interaction that will use this widget binding.
 * @author Arnaud BLOUIN
 */
export abstract class WidgetBindingBase<C extends Command, I extends Interaction<D, FSM>, D extends InteractionData>
implements WidgetBinding<C, I, D> {

    protected timeEnded: number;

    protected timeCancelled: number;

    protected asLogBinding: boolean;

    protected asLogCmd: boolean;

    protected activated: boolean;

    /**
     * The source interaction.
     */
    protected readonly interaction: I;

    /**
     * The current action in progress.
     */
    protected cmd?: C;

    /**
     * Specifies whether the command must be executed on each step of the interaction.
     */
    protected continuousCmdExec: boolean;

    /**
     * The command class to instantiate.
     */
    protected readonly cmdProducer: (i?: D) => C;

    protected readonly cmdsProduced: Subject<C>;

    /**
     * Creates a widget binding.
     * @param continuousExecution Specifies whether the command must be executed on each step of the interaction.
     * @param cmdProducer The type of the command that will be created. Used to instantiate the command by reflexivity.
     * The class must be public and must have a constructor with no parameter.
     * @param interaction The user interaction of the binding.
     * @param widgets The widgets on which the binding will operate.
     */
    protected constructor(continuousExecution: boolean, interaction: I, cmdProducer: (i?: D) => C, widgets: Array<EventTarget>) {
        this.asLogBinding = false;
        this.asLogCmd = false;
        this.continuousCmdExec = false;
        this.timeCancelled = 0;
        this.timeEnded = 0;
        this.cmdsProduced = new Subject();
        this.cmdProducer = cmdProducer;
        this.interaction = interaction;
        this.cmd = undefined;
        this.continuousCmdExec = continuousExecution;
        this.activated = true;
        this.interaction.getFsm().addHandler(this);
        interaction.registerToNodes(widgets);
    }

    public when(): boolean {
        return true;
    }

    public clearEvents(): void {
        this.interaction.fullReinit();
    }

    /**
     * creates the command of the widget binding. If the attribute 'cmd' is not null, nothing will be done.
     * @return The created command or undefined if an error occurred
     */
    protected createCommand(): C | undefined {
        try {
            return this.cmdProducer(this.interaction.getData());
        } catch (ex) {
            ErrorCatcher.getInstance().reportError(ex);
            return undefined;
        }
    }

    public first(): void {
        // To override.
    }

    public then(): void {
        // To override.
    }

    public end(): void {
        // To override.
    }

    public cancel(): void {
        // To override.
    }

    public endOrCancel(): void {
        // To override.
    }

    public ifCmdHadNoEffect(): void {
        // To override.
    }

    public ifCmdHadEffects(): void {
        // to override.
    }

    public ifCannotExecuteCmd(): void {
        // to override.
    }

    public getInteraction(): I {
        return this.interaction;
    }


    public getCommand(): C | undefined {
        return this.cmd;
    }


    public isActivated(): boolean {
        return this.activated;
    }


    public isRunning(): boolean {
        return this.interaction.isRunning();
    }


    public isStrictStart(): boolean {
        return false;
    }

    public fsmCancels(): void {
        if (this.cmd !== undefined) {
            if (this.asLogBinding) {
                catBinder.info("Binding cancelled");
            }
            const hadEffects = this.cmd.hadEffect();
            this.cmd.cancel();
            if (this.asLogCmd) {
                catCommand.info(`Command ${this.cmd.constructor.name} cancelled`);
            }

            if (this.isContinuousCmdExec() && hadEffects) {
                this.cancelContinousWithEffectsCmd(this.cmd);
            }

            this.cmd = undefined;
            this.cancel();
            this.endOrCancel();
            this.timeCancelled++;
        }
    }

    private cancelContinousWithEffectsCmd(c: C): void {
        if (isUndoableType(c)) {
            c.undo();
            if (this.asLogCmd) {
                catCommand.info(`Command ${c.constructor.name} undone`);
            }
        } else {
            throw new MustBeUndoableCmdException(c);
        }
    }

    public fsmStarts(): void {
        if (!this.isActivated()) {
            return;
        }

        const ok: boolean = this.when();

        if (this.asLogBinding) {
            catBinder.info(`Starting binding: ${String(ok)}`);
        }
        if (ok) {
            this.cmd = this.createCommand();
            if (this.cmd !== undefined) {
                this.first();
                if (this.asLogCmd) {
                    catCommand.info(`Command created and init: ${this.cmd.constructor.name}`);
                }
            }
        } else {
            if (this.isStrictStart()) {
                if (this.asLogBinding) {
                    catBinder.info(`Cancelling starting interaction: ${this.interaction.constructor.name}`);
                }
                throw new CancelFSMException();
            }
        }
    }

    public fsmUpdates(): void {
        if (!this.isActivated()) {
            return;
        }

        if (this.asLogBinding) {
            catBinder.info("Binding updates");
        }

        if (this.createAndInitCommand()) {
            if (this.asLogCmd) {
                catCommand.info("Command update");
            }

            this.then();

            if (this.continuousCmdExec) {
                if (this.asLogCmd) {
                    catCommand.info("Try to execute command (continuous execution)");
                }
                const ok = this.cmd?.doIt() ?? false;

                if (this.asLogCmd) {
                    catCommand.info(`Continuous command execution had this result: ${String(ok)}`);
                }

                if (!ok) {
                    this.ifCannotExecuteCmd();
                }
            }
        }
    }


    public fsmStops(): void {
        if (!this.isActivated()) {
            return;
        }

        if (this.asLogBinding) {
            catBinder.info("Binding stops");
        }

        if (this.createAndInitCommand()) {
            if (!this.continuousCmdExec) {
                this.then();
                if (this.asLogCmd) {
                    catCommand.info("Command updated");
                }
            }

            // We are sure here that the command is not undefined
            // (this is the goal of createAndInitCommand)
            this.executeCmd(this.cmd as C);
            this.cmd = undefined;
            this.timeEnded++;
        } else {
            if (this.cmd !== undefined) {
                if (this.asLogCmd) {
                    catCommand.info("Cancelling the command");
                }
                this.cmd.cancel();
                this.cmd = undefined;
                this.timeCancelled++;
            }
        }
    }

    protected createAndInitCommand(): boolean {
        let ok = this.when();

        if (this.asLogBinding) {
            catBinder.info(`when predicate is ${String(ok)}`);
        }

        if (ok) {
            if (this.cmd === undefined) {
                if (this.asLogCmd) {
                    catCommand.info("Command creation");
                }
                this.cmd = this.createCommand();
                ok = this.cmd !== undefined;
                if (ok) {
                    this.first();
                }
            }
        }

        return ok;
    }

    private executeCmd(cmd: C): void {
        this.afterCmdExecuted(cmd, cmd.doIt());
    }

    protected afterCmdExecuted(cmd: C, ok: boolean): void {
        if (this.asLogCmd) {
            catCommand.info(`Command execution had this result: ${String(ok)}`);
        }
        if (ok) {
            this.end();
            this.endOrCancel();
        } else {
            this.ifCannotExecuteCmd();
        }

        // In continuous mode, a command may have been executed in the update routine
        if (cmd.getStatus() !== CmdStatus.executed) {
            return;
        }

        // For commands executed at least one time
        cmd.done();
        this.cmdsProduced.next(cmd);

        const hadEffect: boolean = cmd.hadEffect();

        if (this.asLogCmd) {
            catCommand.info(`Command execution had effect: ${String(hadEffect)}`);
        }

        if (hadEffect) {
            if (cmd.getRegistrationPolicy() === RegistrationPolicy.none) {
                // This case is possible only if the policy of the command changes during
                // its lifecycle using continuous execution:
                // at start, the command policy is no NONE so the command is executed and added.
                // Then the policy changes to NONE so that we must remove it from the registry.
                CommandsRegistry.getInstance().removeCommand(cmd);
            } else {
                CommandsRegistry.getInstance().addCommand(cmd);
            }
            this.ifCmdHadEffects();
        } else {
            this.ifCmdHadNoEffect();
        }
    }

    public uninstallBinding(): void {
        this.setActivated(false);
        this.cmdsProduced.complete();
        this.asLogBinding = false;
        this.asLogCmd = false;
        this.interaction.uninstall();
    }


    public isContinuousCmdExec(): boolean {
        return this.continuousCmdExec;
    }


    public setActivated(activated: boolean): void {
        if (this.asLogBinding) {
            catBinder.info(`Binding Activated: ${String(activated)}`);
        }
        this.activated = activated;
        this.interaction.setActivated(activated);
        if (!this.activated && this.cmd !== undefined) {
            this.cmd.flush();
            this.cmd = undefined;
        }
    }

    /**
     * Logs information related to the binding.
     * @param log True: information will be logged
     */
    public setLogBinding(log: boolean): void {
        this.asLogBinding = log;
    }

    /**
     * Logs information related to the command creation.
     * @param log True: information related to the command creation will be logged
     */
    public setLogCmd(log: boolean): void {
        this.asLogCmd = log;
    }

    /**
     * Logs information related to the user interaction.
     * @param log True: information related to the user interaction will be logged
     */
    public logInteraction(log: boolean): void {
        this.interaction.log(log);
    }

    public produces(): Observable<C> {
        return this.cmdsProduced;
    }

    public getTimesEnded(): number {
        return this.timeEnded;
    }

    public getTimesCancelled(): number {
        return this.timeCancelled;
    }
}
