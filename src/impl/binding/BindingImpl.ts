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

import type {Observable} from "rxjs";
import {Subject} from "rxjs";
import type {Command} from "../../api/command/Command";
import {CmdStatus} from "../../api/command/Command";
import {CancelFSMException} from "../fsm/CancelFSMException";
import type {InteractionData} from "../../api/interaction/InteractionData";
import {catBinding, catCommand} from "../logging/ConfigLog";
import {isUndoableType} from "../../api/undo/Undoable";
import {MustBeUndoableCmdError} from "./MustBeUndoableCmdError";
import type {Binding} from "../../api/binding/Binding";
import type {Interaction} from "../../api/interaction/Interaction";
import type {UndoHistory} from "../../api/undo/UndoHistory";

/**
 * The base class to do bindings, i.e. bindings between user interactions and (undoable) commands.
 * @typeParam C - The type of the command that will produce this binding.
 * @typeParam I - The type of the interaction that will use this binding.
 */
export class BindingImpl<C extends Command, I extends Interaction<D>, D extends InteractionData> implements Binding<C, I, D> {

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

    protected undoHistory: UndoHistory;

    /**
     * Creates a binding.
     * @param continuousExecution - Specifies whether the command must be executed on each step of the interaction.
     * @param cmdProducer - The type of the command that will be created. Used to instantiate the command by reflexivity.
     * The class must be public and must have a constructor with no parameter.
     * @param interaction - The user interaction of the binding.
     * @param widgets - The widgets on which the binding will operate.
     * @param undoHistory - The undo/redo history.
     */
    public constructor(continuousExecution: boolean, interaction: I, cmdProducer: (i?: D) => C,
                       widgets: ReadonlyArray<EventTarget>, undoHistory: UndoHistory) {
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
        this.undoHistory = undoHistory;
        this.interaction.getFsm().addHandler(this);
        interaction.registerToNodes(widgets);
    }

    /**
     * @returns True if the condition of the binding is respected.
     */
    public when(): boolean {
        return true;
    }

    /**
     * Stops the interaction and clears all its events waiting for a process.
     */
    public clearEvents(): void {
        this.interaction.fullReinit();
    }

    /**
     * creates the command of the binding. If the attribute 'cmd' is not null, nothing will be done.
     * @returns The created command or undefined if an error occurred
     */
    protected createCommand(): C | undefined {
        try {
            return this.cmdProducer(this.interaction.getData());
        } catch (ex: unknown) {
            if (ex instanceof Error) {
                catBinding.error("Error while creating a command", ex);
            } else {
                catBinding.warn(`Error while creating a command: ${String(ex)}`);
            }
            return undefined;
        }
    }

    /**
     * Called when an error appeared during the execution of the binding. To override.
     * @param _err - The error.
     */
    public catch(_err: undefined): void {
        // To override.
    }

    /**
     * After being created, this method initialises the command. To override.
     */
    public first(): void {
        // To override.
    }

    /**
     * Updates the current command. To override.
     */
    public then(): void {
        // To override.
    }

    /**
     * When the interaction ends. To override.
     */
    public end(): void {
        // To override.
    }

    /**
     * When the interaction is cancelled. To override.
     */
    public cancel(): void {
        // To override.
    }

    /**
     * When the interaction ends or is cancelled. To override.
     */
    public endOrCancel(): void {
        // To override.
    }

    /**
     * Called when an executed command did not had effect. To override.
     */
    public ifCmdHadNoEffect(): void {
        // To override.
    }

    /**
     * Called when an executed command had effects. To override.
     */
    public ifCmdHadEffects(): void {
        // to override.
    }

    /**
     * Called when an ongoing command cannot be executed. To override.
     */
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
                catBinding.info("Binding cancelled");
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
            throw new MustBeUndoableCmdError(c);
        }
    }

    public fsmStarts(): void {
        if (!this.isActivated()) {
            return;
        }

        const ok: boolean = this.when();

        if (this.asLogBinding) {
            catBinding.info(`Starting binding: ${String(ok)}`);
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
                    catBinding.info(`Cancelling starting interaction: ${this.interaction.constructor.name}`);
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
            catBinding.info("Binding updates");
        }

        if (this.createAndInitCommand()) {
            if (this.asLogCmd) {
                catCommand.info("Command update");
            }

            this.then();

            if (this.continuousCmdExec) {
                this.continuousExecutionOnFSMUpdate();
            }
        }
    }


    private continuousExecutionOnFSMUpdate(): void {
        const ok = this.cmd?.execute() ?? false;

        if (this.asLogCmd) {
            catCommand.info(
                `Try to execute command (continuous execution), is cmd undefined? ${String(this.cmd === undefined)}`);
        }

        if (ok instanceof Promise) {
            ok.then(executed => {
                if (!executed) {
                    this.ifCannotExecuteCmd();
                }

                if (this.asLogCmd) {
                    catCommand.info(`Continuous command execution had this result: ${String(executed)}`);
                }
            }).catch(ex => {
                catCommand.error("Error while executing the command continuously", ex);
            });
        } else {
            if (!ok) {
                this.ifCannotExecuteCmd();
            }

            if (this.asLogCmd) {
                catCommand.info(`Continuous command execution had this result: ${String(ok)}`);
            }
        }
    }


    public fsmStops(): void {
        if (!this.isActivated()) {
            return;
        }

        if (this.asLogBinding) {
            catBinding.info("Binding stops");
        }

        if (this.createAndInitCommand()) {
            this.executeCommandOnFSMStop();
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

    private executeCommandOnFSMStop(): void {
        if (!this.continuousCmdExec) {
            this.then();
            if (this.asLogCmd) {
                catCommand.info("Command updated");
            }
        }

        if (this.cmd !== undefined) {
            // Required to keep the command as because of async it may be set
            // to undefined right after
            const cmdToExecute = this.cmd;
            const result = this.cmd.execute();

            if (result instanceof Promise) {
                result.then(executed => {
                    this.cmd = cmdToExecute;
                    this.afterCmdExecuted(cmdToExecute, executed);
                    // Cannot put these two lines in a finally block:
                    // tests will failed as finally is called *after* the promise is resolved
                    // provoking sync issues (treatments are done as soon as the promise is resolved)
                    this.cmd = undefined;
                    this.timeEnded++;
                }).catch(ex => {
                    catCommand.error("Error while executing the command", ex);
                    this.cmd = undefined;
                    this.timeEnded++;
                });
            } else {
                this.afterCmdExecuted(this.cmd, result);
                this.cmd = undefined;
                this.timeEnded++;
            }
        }
    }

    private createAndInitCommand(): boolean {
        let ok = this.when();

        if (this.asLogBinding) {
            catBinding.info(`when predicate is ${String(ok)}`);
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

    private afterCmdExecuted(cmd: C, ok: boolean): void {
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
            if (isUndoableType(cmd)) {
                this.undoHistory.add(cmd);
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

    /**
     * @returns True: the command must be executed on each step of the interaction.
     */
    public isContinuousCmdExec(): boolean {
        return this.continuousCmdExec;
    }


    public setActivated(activated: boolean): void {
        if (this.asLogBinding) {
            catBinding.info(`Binding Activated: ${String(activated)}`);
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
     * @param log - True: information will be logged
     */
    public setLogBinding(log: boolean): void {
        this.asLogBinding = log;
    }

    /**
     * Logs information related to the command creation.
     * @param log - True: information related to the command creation will be logged
     */
    public setLogCmd(log: boolean): void {
        this.asLogCmd = log;
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
