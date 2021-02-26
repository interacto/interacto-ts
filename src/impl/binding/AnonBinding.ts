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
import {LogLevel} from "../../api/logging/LogLevel";
import {BindingImpl} from "./BindingImpl";
import {catBinding} from "../logging/ConfigLog";
import type {Command} from "../../api/command/Command";
import type {Interaction} from "../../api/interaction/Interaction";
import type {UndoHistory} from "../../api/undo/UndoHistory";

export class AnonBinding<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends BindingImpl<C, I, D> {

    private readonly firstFn?: ((c: C, i: D) => void);

    private readonly thenFn?: (c: C, i: D) => void;

    private readonly whenFn?: (i: D) => boolean;

    private readonly cancelFn?: (i: D) => void;

    private readonly endOrCancelFn?: (i: D) => void;

    private readonly hadEffectsFn?: (c: C, i: D) => void;

    private readonly hadNoEffectFn?: (c: C, i: D) => void;

    private readonly cannotExecFn?: (c: C, i: D) => void;

    private readonly onEndFn?: (c: C, i: D) => void;

    private readonly onErrFn?: (ex: unknown) => void;

    private readonly strictStart: boolean;


    public constructor(continuousExec: boolean, interaction: I, undoHistory: UndoHistory, cmdSupplierFn: (d: D) => C,
                       widgets: ReadonlyArray<EventTarget>, dynamicNodes: ReadonlyArray<Node>,
                       strict: boolean, loggers: ReadonlyArray<LogLevel>, timeoutThrottle: number,
                       stopPropagation: boolean, prevDefault: boolean, firstFn?: (c: C, i: D) => void,
                       thenFn?: (c: C, i: D) => void, whenFn?: (i: D) => boolean,
                       endFn?: (c: C, i: D) => void, cancelFn?: (i: D) => void,
                       endOrCancelFn?: (i: D) => void, hadEffectsFn?: (c: C, i: D) => void,
                       hadNoEffectFn?: (c: C, i: D) => void, cannotExecFn?: (c: C, i: D) => void,
                       onErrFn?: (ex: unknown) => void) {
        super(continuousExec, interaction, cmdSupplierFn, widgets, undoHistory);
        this.configureLoggers(loggers);
        this.firstFn = firstFn;
        this.thenFn = thenFn;
        this.cancelFn = cancelFn;
        this.endOrCancelFn = endOrCancelFn;
        this.whenFn = whenFn;
        this.onEndFn = endFn;
        this.strictStart = strict;
        this.hadEffectsFn = hadEffectsFn;
        this.hadNoEffectFn = hadNoEffectFn;
        this.cannotExecFn = cannotExecFn;
        this.onErrFn = onErrFn;

        this.interaction.stopImmediatePropagation = stopPropagation;
        this.interaction.preventDefault = prevDefault;
        this.interaction.setThrottleTimeout(timeoutThrottle);
        dynamicNodes.forEach(node => {
            interaction.registerToNodeChildren(node);
        });
    }

    private configureLoggers(loggers: ReadonlyArray<LogLevel>): void {
        if (loggers.length !== 0) {
            this.setLogCmd(loggers.includes(LogLevel.command.valueOf()));
            this.setLogBinding(loggers.includes(LogLevel.binding.valueOf()));
            this.interaction.log(loggers.includes(LogLevel.interaction.valueOf()));
        }
    }

    public isStrictStart(): boolean {
        return this.strictStart;
    }

    public first(): void {
        const cmd = this.getCommand();
        if (this.firstFn !== undefined && cmd !== undefined) {
            try {
                this.firstFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'first'", ex);
                } else {
                    catBinding.warn(`Crash in 'first': ${String(ex)}`);
                }
            }
        }
    }

    public then(): void {
        const cmd = this.getCommand();
        if (this.thenFn !== undefined && cmd !== undefined) {
            try {
                this.thenFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'then'", ex);
                } else {
                    catBinding.warn(`Crash in 'then': ${String(ex)}`);
                }
            }
        }
    }

    public end(): void {
        const cmd = this.getCommand();
        if (this.onEndFn !== undefined && cmd !== undefined) {
            try {
                this.onEndFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'end'", ex);
                } else {
                    catBinding.warn(`Crash in 'end': ${String(ex)}`);
                }
            }
        }
    }

    public cancel(): void {
        if (this.cancelFn !== undefined) {
            try {
                this.cancelFn(this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'cancel'", ex);
                } else {
                    catBinding.warn(`Crash in 'cancel': ${String(ex)}`);
                }
            }
        }
    }

    public endOrCancel(): void {
        if (this.endOrCancelFn !== undefined) {
            try {
                this.endOrCancelFn(this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'endOrCancel'", ex);
                } else {
                    catBinding.warn(`Crash in 'endOrCancel': ${String(ex)}`);
                }
            }
        }
    }

    public ifCmdHadNoEffect(): void {
        const cmd = this.getCommand();
        if (this.hadNoEffectFn !== undefined && cmd !== undefined) {
            try {
                this.hadNoEffectFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'ifHadNoEffect'", ex);
                } else {
                    catBinding.warn(`Crash in 'ifHadNoEffect': ${String(ex)}`);
                }
            }
        }
    }

    public ifCmdHadEffects(): void {
        const cmd = this.getCommand();
        if (this.hadEffectsFn !== undefined && cmd !== undefined) {
            try {
                this.hadEffectsFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'ifHadEffects'", ex);
                } else {
                    catBinding.warn(`Crash in 'ifHadEffects': ${String(ex)}`);
                }
            }
        }
    }

    public ifCannotExecuteCmd(): void {
        const cmd = this.getCommand();
        if (this.cannotExecFn !== undefined && cmd !== undefined) {
            try {
                this.cannotExecFn(cmd, this.getInteraction().getData());
            } catch (ex: unknown) {
                this.catch(ex);
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'ifCannotExecute'", ex);
                } else {
                    catBinding.warn(`Crash in 'ifCannotExecute': ${String(ex)}`);
                }
            }
        }
    }

    public when(): boolean {
        let ok;
        try {
            ok = this.whenFn === undefined || this.whenFn(this.getInteraction().getData());
        } catch (ex: unknown) {
            ok = false;
            this.catch(ex);
            if (ex instanceof Error) {
                catBinding.error("Crash in 'when'", ex);
            } else {
                catBinding.warn(`Crash in 'when': ${String(ex)}`);
            }
        }
        if (this.asLogBinding) {
            catBinding.info(`Checking condition: ${String(ok)}`);
        }
        return ok;
    }


    public catch(err: unknown): void {
        if (this.onErrFn !== undefined) {
            try {
                this.onErrFn(err);
            } catch (ex: unknown) {
                if (ex instanceof Error) {
                    catBinding.error("Crash in 'catch'", ex);
                } else {
                    catBinding.warn(`Crash in 'catch': ${String(ex)}`);
                }
            }
        }
    }
}
