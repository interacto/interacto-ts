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

import {FSM} from "../fsm/FSM";
import {InteractionData} from "../interaction/InteractionData";
import {LogLevel} from "../logging/LogLevel";
import {WidgetBindingBase} from "./WidgetBindingBase";
import {InteractionBase} from "../interaction/InteractionBase";
import {catBinder} from "../logging/ConfigLog";
import {Command} from "../command/Command";

export class AnonBinding<C extends Command, I extends InteractionBase<D, FSM>, D extends InteractionData>
    extends WidgetBindingBase<C, I, D> {

    private readonly execInitCmd?: ((c: C, i: D) => void);

    private readonly execUpdateCmd?: (c: C, i: D) => void;

    private readonly checkInteraction?: (i: D) => boolean;

    private readonly cancelFct?: (i: D) => void;

    private readonly endOrCancelFct?: (i: D) => void;

    private readonly hadEffectsFct?: (c: C, i: D) => void;

    private readonly hadNoEffectFct?: (c: C, i: D) => void;

    private readonly cannotExecFct?: (c: C, i: D) => void;

    private readonly onEnd?: (c: C, i: D) => void;

    private readonly strictStart: boolean;


    public constructor(continuousExec: boolean, interaction: I, cmdProducer: (d: D) => C,
                       widgets: Array<EventTarget>, dynamicNodes: Array<Node>,
                       // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
                       strict: boolean, loggers: Array<LogLevel>, timeoutThrottle: number,
                       stopPropa: boolean, prevDef: boolean,
                       initCmdFct?: (c: C, i: D) => void,
                       updateCmdFct?: (c: C, i: D) => void, check?: (i: D) => boolean,
                       onEndFct?: (c: C, i: D) => void, cancel?: (i: D) => void,
                       endOrCancel?: (i: D) => void, hadEffectsFct?: (c: C, i: D) => void,
                       hadNoEffectFct?: (c: C, i: D) => void, cannotExecFct?: (c: C, i: D) => void) {
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

        this.interaction.stopImmediatePropagation = stopPropa;
        this.interaction.preventDefault = prevDef;
        // this.interaction.setThrottleTimeout(timeoutThrottle);
        dynamicNodes.forEach(node => interaction.registerToNodeChildren(node));
    }

    private configureLoggers(loggers: Array<LogLevel>): void {
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
            this.execInitCmd(cmd, this.getInteraction().getData());
        }
    }

    public then(): void {
        const cmd = this.getCommand();
        if (this.execUpdateCmd !== undefined && cmd !== undefined) {
            this.execUpdateCmd(cmd, this.getInteraction().getData());
        }
    }

    public end(): void {
        const cmd = this.getCommand();
        if (this.onEnd !== undefined && cmd !== undefined) {
            this.onEnd(cmd, this.getInteraction().getData());
        }
    }

    public cancel(): void {
        if (this.cancelFct !== undefined) {
            this.cancelFct(this.getInteraction().getData());
        }
    }

    public endOrCancel(): void {
        if (this.endOrCancelFct !== undefined) {
            this.endOrCancelFct(this.getInteraction().getData());
        }
    }

    public ifCmdHadNoEffect(): void {
        const cmd = this.getCommand();
        if (this.hadNoEffectFct !== undefined && cmd !== undefined) {
            this.hadNoEffectFct(cmd, this.getInteraction().getData());
        }
    }

    public ifCmdHadEffects(): void {
        const cmd = this.getCommand();
        if (this.hadEffectsFct !== undefined && cmd !== undefined) {
            this.hadEffectsFct(cmd, this.getInteraction().getData());
        }
    }

    public ifCannotExecuteCmd(): void {
        const cmd = this.getCommand();
        if (this.cannotExecFct !== undefined && cmd !== undefined) {
            this.cannotExecFct(cmd, this.getInteraction().getData());
        }
    }

    public when(): boolean {
        const ok = this.checkInteraction === undefined || this.checkInteraction(this.getInteraction().getData());
        if (this.asLogBinding) {
            catBinder.info(`Checking condition:  ${String(ok)}`);
        }
        return ok;
    }
}
