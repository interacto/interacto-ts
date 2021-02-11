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

import {InteractionData} from "../../api/interaction/InteractionData";
import {LogLevel} from "../../api/logging/LogLevel";
import {BindingImpl} from "./BindingImpl";
import {catBinding} from "../../api/logging/ConfigLog";
import {Command} from "../../api/command/Command";
import {Interaction} from "../../api/interaction/Interaction";

export class AnonBinding<C extends Command, I extends Interaction<D>, D extends InteractionData>
    extends BindingImpl<C, I, D> {

    private readonly execInitCmd?: ((c: C, i: D) => void);

    private readonly execUpdateCmd?: (c: C, i: D) => void;

    private readonly checkInteraction?: (i: D) => boolean;

    private readonly cancelFct?: (i: D) => void;

    private readonly endOrCancelFct?: (i: D) => void;

    private readonly hadEffectsFct?: (c: C, i: D) => void;

    private readonly hadNoEffectFct?: (c: C, i: D) => void;

    private readonly cannotExecFct?: (c: C, i: D) => void;

    private readonly onEnd?: (c: C, i: D) => void;

    private readonly onErr?: (ex: unknown) => void;

    private readonly strictStart: boolean;


    public constructor(continuousExec: boolean, interaction: I, cmdProducer: (d: D) => C,
                       widgets: ReadonlyArray<EventTarget>, dynamicNodes: ReadonlyArray<Node>,
                       strict: boolean, loggers: ReadonlyArray<LogLevel>, timeoutThrottle: number,
                       stopPropa: boolean, prevDef: boolean,
                       initCmdFct?: (c: C, i: D) => void,
                       updateCmdFct?: (c: C, i: D) => void, check?: (i: D) => boolean,
                       onEndFct?: (c: C, i: D) => void, cancel?: (i: D) => void,
                       endOrCancel?: (i: D) => void, hadEffectsFct?: (c: C, i: D) => void,
                       hadNoEffectFct?: (c: C, i: D) => void, cannotExecFct?: (c: C, i: D) => void,
                       onErrFn?: (ex: unknown) => void) {
        super(continuousExec, interaction, cmdProducer, widgets);
        this.configureLoggers(loggers);
        this.execInitCmd = initCmdFct;
        this.execUpdateCmd = updateCmdFct;
        this.cancelFct = cancel;
        this.endOrCancelFct = endOrCancel;
        this.checkInteraction = check;
        this.onEnd = onEndFct;
        this.strictStart = strict;
        this.hadEffectsFct = hadEffectsFct;
        this.hadNoEffectFct = hadNoEffectFct;
        this.cannotExecFct = cannotExecFct;
        this.onErr = onErrFn;

        this.interaction.stopImmediatePropagation = stopPropa;
        this.interaction.preventDefault = prevDef;
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
        if (this.execInitCmd !== undefined && cmd !== undefined) {
            try {
                this.execInitCmd(cmd, this.getInteraction().getData());
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
        if (this.execUpdateCmd !== undefined && cmd !== undefined) {
            try {
                this.execUpdateCmd(cmd, this.getInteraction().getData());
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
        if (this.onEnd !== undefined && cmd !== undefined) {
            try {
                this.onEnd(cmd, this.getInteraction().getData());
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
        if (this.cancelFct !== undefined) {
            try {
                this.cancelFct(this.getInteraction().getData());
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
        if (this.endOrCancelFct !== undefined) {
            try {
                this.endOrCancelFct(this.getInteraction().getData());
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
        if (this.hadNoEffectFct !== undefined && cmd !== undefined) {
            try {
                this.hadNoEffectFct(cmd, this.getInteraction().getData());
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
        if (this.hadEffectsFct !== undefined && cmd !== undefined) {
            try {
                this.hadEffectsFct(cmd, this.getInteraction().getData());
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
        if (this.cannotExecFct !== undefined && cmd !== undefined) {
            try {
                this.cannotExecFct(cmd, this.getInteraction().getData());
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
            ok = this.checkInteraction === undefined || this.checkInteraction(this.getInteraction().getData());
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
        if (this.onErr !== undefined) {
            try {
                this.onErr(err);
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
