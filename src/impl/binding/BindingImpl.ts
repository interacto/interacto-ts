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

import {MustBeUndoableCmdError} from "./MustBeUndoableCmdError";
import {isUndoableType} from "../../api/undo/Undoable";
import {Subject} from "rxjs";
import type {Binding} from "../../api/binding/Binding";
import type {VisitorBinding} from "../../api/binding/VisitorBinding";
import type {RuleName, Severity} from "../../api/checker/Checker";
import type {Command} from "../../api/command/Command";
import type {Interaction, InteractionDataType} from "../../api/interaction/Interaction";
import type {Logger} from "../../api/logging/Logger";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";
import type {Observable} from "rxjs";

/**
 * The base class to do bindings, i.e. bindings between user interactions and (undoable) commands.
 * @typeParam C - The type of the command that will produce this binding.
 * @typeParam I - The type of the interaction that will use this binding.
 * @typeParam A - The type of the accumulator.
 * @typeParam D - The interaction data type (infered from the interaction type)
 * @category Binding
 */
// eslint-disable-next-line no-use-before-define
export class BindingImpl<C extends Command, I extends Interaction<D>, A, D extends object = InteractionDataType<I>>
implements Binding<C, I, A, D> {

    protected _name: string | undefined;

    protected _timeEnded: number;

    protected _timeCancelled: number;

    protected _activated: boolean;

    /**
     * The source interaction.
     */
    protected readonly _interaction: I;

    public accumulator: A;

    public readonly linterRules: ReadonlyMap<RuleName, Severity>;

    /**
     * The current action in progress.
     */
    protected _cmd: C | undefined;

    public readonly continuousCmdExecution: boolean;

    /**
     * The command class to instantiate.
     */
    protected readonly cmdProducer: (i?: D) => C;

    protected readonly cmdsProduced: Subject<C>;

    protected readonly accumulatorInit: A | undefined;

    protected undoHistory: UndoHistoryBase;

    protected logger: Logger;

    public logBinding: boolean;

    /**
     * Logs binding usage information, to perform data analysis on usage
     */
    public logCmd: boolean;

    public logUsage: boolean;

    /**
     * Creates a binding.
     * @param continuousExecution - Specifies whether the command must be executed on each step of the interaction.
     * @param interaction - The user interaction of the binding.
     * @param cmdProducer - The type of the command that will be created. Used to instantiate the command by reflexivity.
     * The class must be public and must have a constructor with no parameter.
     * @param widgets - The widgets on which the binding will operate.
     * @param undoHistory - The undo/redo history.
     * @param logger - The logger to use
     * @param linterRules - The linting rules to use
     * @param name - The optional name of the binding. If not provided, computed based on the interaction and command names
     * @param accInit - The initial accumulator to use during the binding execution.
     */
    public constructor(continuousExecution: boolean, interaction: I, cmdProducer: (i?: D) => C,
                       widgets: ReadonlyArray<unknown>, undoHistory: UndoHistoryBase, logger: Logger,
                       linterRules: ReadonlyMap<RuleName, Severity>, name?: string, accInit?: A) {
        // The name is partial until the binding procudes its first command
        this._name = name;
        this.linterRules = linterRules;
        this.accumulatorInit = accInit;
        this.logBinding = false;
        this.logCmd = false;
        this.logUsage = false;
        this._timeCancelled = 0;
        this._timeEnded = 0;
        this.accumulator = {...this.accumulatorInit} as A;
        this.cmdsProduced = new Subject();
        this.cmdProducer = cmdProducer;
        this._interaction = interaction;
        this._cmd = undefined;
        this.continuousCmdExecution = continuousExecution;
        this._activated = true;
        this.undoHistory = undoHistory;
        this.logger = logger;
        this._interaction.fsm.addHandler({
            "fsmStarts": () => {
                this.fsmStarts();
            },
            "fsmUpdates": () => {
                this.fsmUpdates();
            },
            "fsmStops": () => {
                this.fsmStops();
            },
            "fsmCancels": () => {
                this.fsmCancels();
            },
            "fsmError": (err: unknown) => {
                this.fsmError(err);
            }
        });
        interaction.registerToNodes(widgets);
    }

    private reinitAccumulator(): void {
        this.accumulator = {...this.accumulatorInit} as A;
    }

    public get name(): string {
        return this._name ?? this._interaction.constructor.name;
    }

    protected whenStart(): boolean {
        return true;
    }

    protected whenUpdate(): boolean {
        return true;
    }

    protected whenStop(): boolean {
        return true;
    }

    /**
     * Stops the interaction and clears all its events waiting for a process.
     */
    public clearEvents(): void {
        this._interaction.fullReinit();
    }

    /**
     * creates the command of the binding. If the attribute 'cmd' is not null, nothing will be done.
     * @returns The created command or undefined if an error occurred
     */
    protected createCommand(): C | undefined {
        try {
            const cmd = this.cmdProducer(this.interaction.data);
            /*
             * Updating the name of the binding according to the name of the command.
             * Cannot be done elsewhere since we cannot access the concrete type of the command.
             */
            if (this._name === undefined) {
                this._name = `${this._interaction.constructor.name}:${cmd.constructor.name}`;
            }
            return cmd;
        } catch (error: unknown) {
            this.logger.logBindingErr("Error while creating a command", error);
            this.catch(error);
            return undefined;
        }
    }

    public isWhenDefined(): boolean {
        return false;
    }

    /**
     * Called when an error appeared during the execution of the binding. To override.
     * @param _err - The error.
     */
    public catch(_err: unknown): void {
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

    public get interaction(): I {
        return this._interaction;
    }

    public get command(): C | undefined {
        return this._cmd;
    }

    public get activated(): boolean {
        return this._activated;
    }

    public set activated(activated: boolean) {
        if (this.logBinding) {
            this.logger.logBindingMsg(`Binding Activated: ${String(activated)}`);
        }
        this._activated = activated;
        this._interaction.setActivated(activated);
        if (!this._activated && this._cmd !== undefined) {
            this._cmd.flush();
            this._cmd = undefined;
        }
        this.reinitAccumulator();
    }

    public get running(): boolean {
        return this._interaction.isRunning();
    }

    protected fsmError(err: unknown): void {
        if (this.logBinding) {
            this.logger.logBindingErr("", err);
        }
        this.catch(err);
    }

    protected fsmCancels(): void {
        if (this._cmd !== undefined) {
            if (this.logBinding) {
                this.logger.logBindingMsg("Binding cancelled");
            }
            this._cmd.cancel();
            if (this.logCmd) {
                this.logger.logCmdMsg("Cancelling command", this._cmd.constructor.name);
            }

            try {
                if (this.continuousCmdExecution) {
                    this.cancelContinousWithEffectsCmd(this._cmd);
                }
            } finally {
                this._cmd = undefined;
                this.cancel();
                this.endOrCancel();
                this._timeCancelled++;
            }
        }

        this.reinitAccumulator();

        if (this.logUsage) {
            this.logger.logBindingEnd(this.name, true);
        }
    }

    private cancelContinousWithEffectsCmd(cmd: C): void {
        if (isUndoableType(cmd)) {
            cmd.undo();
            if (this.logCmd) {
                this.logger.logCmdMsg("Command undone", cmd.constructor.name);
            }
        } else {
            throw new MustBeUndoableCmdError(cmd);
        }
    }

    protected fsmStarts(): void {
        if (!this._activated) {
            return;
        }

        const ok: boolean = this.whenStart();

        if (this.logBinding) {
            this.logger.logBindingMsg(`Starting binding: ${String(ok)}`);
        }
        if (ok) {
            this.reinitAccumulator();
            this._cmd = this.createCommand();
            if (this._cmd !== undefined) {
                this.first();
                if (this.logCmd) {
                    this.logger.logCmdMsg("Command created and init", this._cmd.constructor.name);
                }
            }
        }

        if (this.logUsage) {
            this.logger.logBindingStart(this.name);
        }
    }

    protected fsmUpdates(): void {
        if (!this._activated) {
            return;
        }

        if (this.logBinding) {
            this.logger.logBindingMsg("Binding updates");
        }

        const cmd = this.createAndInitCommand(this.whenUpdate());
        if (cmd !== undefined) {
            if (this.logCmd) {
                this.logger.logCmdMsg("Command update");
            }

            this.then();

            if (this.continuousCmdExecution) {
                this.continuousExecutionOnFSMUpdate(cmd);
            }
        }
    }

    private continuousExecutionOnFSMUpdate(cmd: C): void {
        const ok = cmd.execute();

        if (this.logCmd) {
            this.logger.logCmdMsg(`Try to execute command (continuous execution), is cmd undefined? ${String(this._cmd === undefined)}`);
        }

        if (ok instanceof Promise) {
            ok.then(executed => {
                if (!executed) {
                    this.ifCannotExecuteCmd();
                }

                if (this.logCmd) {
                    this.logger.logCmdMsg(`Continuous command execution had this result: ${String(executed)}`);
                }
            }).catch((error: unknown) => {
                this.logger.logCmdErr("Error while executing the command continuously", error);
            });
        } else {
            if (!ok) {
                this.ifCannotExecuteCmd();
            }

            if (this.logCmd) {
                this.logger.logCmdMsg(`Continuous command execution had this result: ${String(ok)}`);
            }
        }
    }

    protected fsmStops(): void {
        if (!this._activated) {
            return;
        }

        if (this.logBinding) {
            this.logger.logBindingMsg("Binding stops");
        }

        let cancelled = false;
        const cmd = this.createAndInitCommand(this.whenStop());

        if (cmd === undefined) {
            if (this._cmd !== undefined) {
                if (this.logCmd) {
                    this.logger.logCmdMsg("Cancelling the command");
                }
                this._cmd.cancel();

                try {
                    if (this.continuousCmdExecution) {
                        this.cancelContinousWithEffectsCmd(this._cmd);
                    }
                } finally {
                    this._cmd = undefined;
                    this.cancel();
                    this.endOrCancel();
                    this._timeCancelled++;
                    cancelled = true;
                }
            }
        } else {
            this.executeCommandOnFSMStop(cmd);
        }

        this.reinitAccumulator();

        if (this.logUsage) {
            this.logger.logBindingEnd(this.name, cancelled);
        }
    }

    private executeCommandOnFSMStop(cmd: C): void {
        if (!this.continuousCmdExecution) {
            this.then();
            if (this.logCmd) {
                this.logger.logCmdMsg("Command updated");
            }
        }

        /*
         * Required to keep the command as because of async it may be set
         * to undefined right after
         */
        const result = cmd.execute();

        if (result instanceof Promise) {
            result.then(executed => {
                this._cmd = cmd;
                this.afterCmdExecuted(cmd, executed);
                /*
                 * Cannot put these two lines in a finally block:
                 * tests will failed as finally is called *after* the promise is resolved
                 * provoking sync issues (treatments are done as soon as the promise is resolved)
                 */
                this._cmd = undefined;
                this._timeEnded++;
            }).catch((error: unknown) => {
                this.logger.logCmdErr("Error while executing the command", error);
                this._cmd = undefined;
                this._timeEnded++;
            });
        } else {
            this.afterCmdExecuted(cmd, result);
            this._cmd = undefined;
            this._timeEnded++;
        }
    }

    private createAndInitCommand(whenOk: boolean): C | undefined {
        if (this.logBinding) {
            this.logger.logBindingMsg(`when predicate is ${String(whenOk)}`);
        }

        if (whenOk) {
            if (this._cmd === undefined) {
                if (this.logCmd) {
                    this.logger.logCmdMsg("Command creation");
                }
                this._cmd = this.createCommand();
                if (this._cmd !== undefined) {
                    this.first();
                }
            }

            return this._cmd;
        }

        return undefined;
    }

    private afterCmdExecuted(cmd: C, ok: boolean): void {
        if (this.logCmd) {
            this.logger.logCmdMsg(`Command execution had this result: ${String(ok)}`);
        }
        if (ok) {
            this.end();
            this.endOrCancel();
        } else {
            this.ifCannotExecuteCmd();
        }

        // In continuous mode, a command may have been executed in the update routine
        if (cmd.getStatus() !== "executed") {
            return;
        }

        // For commands executed at least one time
        cmd.done();
        this.cmdsProduced.next(cmd);

        const hadEffect: boolean = cmd.hadEffect();

        if (this.logCmd) {
            this.logger.logCmdMsg(`Command execution had effect: ${String(hadEffect)}`);
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
        this.activated = false;
        this.cmdsProduced.complete();
        this.logBinding = false;
        this.logCmd = false;
        this.logUsage = false;
        this._interaction.uninstall();
    }

    public get produces(): Observable<C> {
        return this.cmdsProduced;
    }

    public get timesEnded(): number {
        return this._timeEnded;
    }

    public get timesCancelled(): number {
        return this._timeCancelled;
    }

    public acceptVisitor(visitor: VisitorBinding): void {
        visitor.visitBinding(this);
    }
}
