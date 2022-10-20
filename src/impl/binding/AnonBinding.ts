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

import type {InteractionData} from "../../api/interaction/InteractionData";
import type {LogLevel} from "../../api/logging/LogLevel";
import {BindingImpl} from "./BindingImpl";
import type {Command} from "../../api/command/Command";
import type {Interaction} from "../../api/interaction/Interaction";
import type {Logger} from "../../api/logging/Logger";
import type {UndoHistoryBase} from "../../api/undo/UndoHistoryBase";
import type {When} from "../../api/binder/When";
import {isWhenAtEnd, isWhenAtStart, isWhenAtThen, isWhenStrict} from "../../api/binder/When";
import {CancelFSMError} from "../fsm/CancelFSMError";

export class AnonBinding<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends BindingImpl<C, I, D> {

    private readonly firstFn?: ((c: C, i: D) => void);

    private readonly thenFn?: (c: C, i: D) => void;

    private readonly whenFn?: Array<When<D>>;

    private readonly cancelFn?: (i: D) => void;

    private readonly endOrCancelFn?: (i: D) => void;

    private readonly hadEffectsFn?: (c: C, i: D) => void;

    private readonly hadNoEffectFn?: (c: C, i: D) => void;

    private readonly cannotExecFn?: (c: C, i: D) => void;

    private readonly onEndFn?: (c: C, i: D) => void;

    private readonly onErrFn?: (ex: unknown) => void;

    public constructor(continuousExec: boolean, interaction: I, undoHistory: UndoHistoryBase, logger: Logger, cmdSupplierFn: (d: D) => C,
                       widgets: ReadonlyArray<unknown>, dynamicNodes: ReadonlyArray<Node>,
                       loggers: ReadonlyArray<LogLevel>, timeoutThrottle: number,
                       stopPropagation: boolean, prevDefault: boolean, firstFn?: (c: C, i: D) => void,
                       thenFn?: (c: C, i: D) => void, whenFn?: Array<When<D>>,
                       endFn?: (c: C, i: D) => void, cancelFn?: (i: D) => void,
                       endOrCancelFn?: (i: D) => void, hadEffectsFn?: (c: C, i: D) => void,
                       hadNoEffectFn?: (c: C, i: D) => void, cannotExecFn?: (c: C, i: D) => void,
                       onErrFn?: (ex: unknown) => void, name?: string) {
        super(continuousExec, interaction, cmdSupplierFn, widgets, undoHistory, logger, name);
        this.configureLoggers(loggers);
        this.firstFn = firstFn;
        this.thenFn = thenFn;
        this.cancelFn = cancelFn;
        this.endOrCancelFn = endOrCancelFn;
        this.whenFn = whenFn;
        this.onEndFn = endFn;
        this.hadEffectsFn = hadEffectsFn;
        this.hadNoEffectFn = hadNoEffectFn;
        this.cannotExecFn = cannotExecFn;
        this.onErrFn = onErrFn;

        this.interaction.stopImmediatePropagation = stopPropagation;
        this.interaction.preventDefault = prevDefault;
        this.interaction.setThrottleTimeout(timeoutThrottle);
        for (const node of dynamicNodes) {
            interaction.registerToNodeChildren(node);
        }
    }

    private configureLoggers(loggers: ReadonlyArray<LogLevel>): void {
        if (loggers.length > 0) {
            this.logCmd = loggers.includes("command");
            this.logBinding = loggers.includes("binding");
            this.logUsage = loggers.includes("usage");
            this.interaction.log(loggers.includes("interaction"));
        }
    }

    public override first(): void {
        const cmd = this.command;
        if (this.firstFn !== undefined && cmd !== undefined) {
            try {
                this.firstFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'first'", error);
            }
        }
    }

    // eslint-disable-next-line unicorn/no-thenable
    public override then(): void {
        const cmd = this.command;
        if (this.thenFn !== undefined && cmd !== undefined) {
            try {
                this.thenFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'then'", error);
            }
        }
    }

    public override end(): void {
        const cmd = this.command;
        if (this.onEndFn !== undefined && cmd !== undefined) {
            try {
                this.onEndFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'end'", error);
            }
        }
    }

    public override cancel(): void {
        if (this.cancelFn !== undefined) {
            try {
                this.cancelFn(this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'cancel'", error);
            }
        }
    }

    public override endOrCancel(): void {
        if (this.endOrCancelFn !== undefined) {
            try {
                this.endOrCancelFn(this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'endOrCancel'", error);
            }
        }
    }

    public override ifCmdHadNoEffect(): void {
        const cmd = this.command;
        if (this.hadNoEffectFn !== undefined && cmd !== undefined) {
            try {
                this.hadNoEffectFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'ifHadNoEffect'", error);
            }
        }
    }

    public override ifCmdHadEffects(): void {
        const cmd = this.command;
        if (this.hadEffectsFn !== undefined && cmd !== undefined) {
            try {
                this.hadEffectsFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'ifHadEffects'", error);
            }
        }
    }

    public override ifCannotExecuteCmd(): void {
        const cmd = this.command;
        if (this.cannotExecFn !== undefined && cmd !== undefined) {
            try {
                this.cannotExecFn(cmd, this.interaction.data);
            } catch (error: unknown) {
                this.catch(error);
                this.logger.logBindingErr("Crash in 'ifCannotExecute'", error);
            }
        }
    }

    protected override whenStart(): boolean {
        return this.whenChecker(when => isWhenAtStart(when.type));
    }

    protected override whenUpdate(): boolean {
        return this.whenChecker(when => isWhenAtThen(when.type));
    }

    protected override whenStop(): boolean {
        return this.whenChecker(when => isWhenAtEnd(when.type));
    }

    private whenChecker(filterPredicate: (when: When<D>) => boolean): boolean {
        const ok = this.whenFn
            ?.filter(filterPredicate)
            .every(when => this.executeWhen(when)) ?? false;
        if (this.logBinding) {
            this.logger.logBindingMsg(`Checking condition: ${String(ok)}`);
        }
        return ok;
    }

    private executeWhen(when: When<D>): boolean {
        let res: boolean;
        try {
            res = when.fn(this.interaction.data);
        } catch (error: unknown) {
            res = false;
            this.catch(error);
            this.logger.logBindingErr("Crash in checking condition", error);
        }
        if (!res && isWhenStrict(when.type)) {
            if (this.logBinding) {
                this.logger.logBindingMsg(`Cancelling interaction: ${this._interaction.constructor.name}`);
            }
            throw new CancelFSMError();
        }

        return res;
    }

    public override catch(err: unknown): void {
        if (this.onErrFn !== undefined) {
            try {
                this.onErrFn(err);
            } catch (error: unknown) {
                this.logger.logBindingErr("Crash in 'catch'", error);
            }
        }
    }
}
