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


import {CmdStatus, Command, RegistrationPolicy} from "./Command";
import {CommandsRegistry} from "./CommandsRegistry";

/**
 * The default constructor.
 * Initialises the current status to created.
 * @class
 * @author Arnaud BLOUIN
 */
export abstract class CommandImpl implements Command {
    /**
	 * Execute if possible (canDo) the given command (if not null) and flush it.
	 * @param cmd The command to execute. Nothing done if null.
	 */
	public static executeAndFlush(cmd: Command): void {
		if (cmd.canDo()) {
			cmd.doIt();
		}
		cmd.flush();
    }

    /**
     * The state of the command.
     */
    protected status: CmdStatus;

    protected constructor() {
        this.status = CmdStatus.CREATED;
    }

    /**
     *
     */
    public flush(): void {
        this.status = CmdStatus.FLUSHED;
    }

    /**
     * Actions may need to create a memento before their first execution.
     * This is the goal of the operation that should be overriden.
     * This operator is called a single time before the first execution of the command.
     */
    protected createMemento(): void {
    }

    /**
     *
     * @return {boolean}
     */
    public doIt(): boolean {
        let ok: boolean;
        if ((this.status === CmdStatus.CREATED || this.status === CmdStatus.EXECUTED) && this.canDo()) {
            if (this.status === CmdStatus.CREATED) {
                this.createMemento();
            }
            ok = true;
            this.doCmdBody();
            this.status = CmdStatus.EXECUTED;
            CommandsRegistry.INSTANCE.onActionExecuted(this);
        } else {
            ok = false;
        }
        return ok;
    }

    /**
     * This method contains the statements to execute the command.
     * This method is automatically called by DoIt and must not be called explicitly.
     * @since 0.1
     */
    protected abstract doCmdBody(): void;

    public getRegistrationPolicy(): RegistrationPolicy {
        return this.hadEffect() ? RegistrationPolicy.LIMITED : RegistrationPolicy.NONE;
    }

    /**
     *
     * @return {boolean}
     */
    public hadEffect(): boolean {
        return this.isDone();
    }

    /**
     *
     * @param {*} cmd
     * @return {boolean}
     */
    public unregisteredBy(cmd: Command): boolean {
        return false;
    }

    /**
     *
     */
    public done(): void {
        if (this.status === CmdStatus.CREATED || this.status === CmdStatus.EXECUTED) {
            this.status = CmdStatus.DONE;
            CommandsRegistry.INSTANCE.onActionDone(this);
        }
    }

    /**
     *
     * @return {boolean}
     */
    public isDone(): boolean {
        return this.status === CmdStatus.DONE;
    }

    /**
     *
     */
    public cancel(): void {
        this.status = CmdStatus.CANCELLED;
    }

    public getStatus(): CmdStatus {
        return this.status;
    }

    public followingCmds(): Array<Command> {
        return [];
    }

    public abstract canDo(): boolean;
}
