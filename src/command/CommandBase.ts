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

/**
 * The base implementation class for coding UI commands.
 */
export abstract class CommandBase implements Command {
    /**
     * The state of the command.
     */
    protected status: CmdStatus;

    /**
     * Creates the command with the status CREATED.
     */
    public constructor() {
        this.status = CmdStatus.created;
    }

    /**
     * Flushes the UI command.
     * The command must not be used after that.
     */
    public flush(): void {
        this.status = CmdStatus.flushed;
    }

    /**
     * Actions may need to create a memento before their first execution.
     * This is the goal of the operation that should be overridden.
     * This operator is called a single time before the first execution of the command.
     */
    protected createMemento(): void {
    }

    public doIt(): boolean {
        let ok: boolean;
        if ((this.status === CmdStatus.created || this.status === CmdStatus.executed) && this.canDo()) {
            if (this.status === CmdStatus.created) {
                this.createMemento();
            }
            ok = true;
            this.doCmdBody();
            this.status = CmdStatus.executed;
        } else {
            ok = false;
        }
        return ok;
    }

    /**
     * This method contains the statements to execute the command.
     * This method is automatically called by DoIt and must not be called explicitly.
     */
    protected abstract doCmdBody(): void;

    public getRegistrationPolicy(): RegistrationPolicy {
        return this.hadEffect() ? RegistrationPolicy.limited : RegistrationPolicy.none;
    }

    public hadEffect(): boolean {
        return this.isDone();
    }

    public done(): void {
        if (this.status === CmdStatus.created || this.status === CmdStatus.executed) {
            this.status = CmdStatus.done;
        }
    }

    public isDone(): boolean {
        return this.status === CmdStatus.done;
    }

    public cancel(): void {
        this.status = CmdStatus.cancelled;
    }

    public getStatus(): CmdStatus {
        return this.status;
    }

    public canDo(): boolean {
        return true;
    }
}
