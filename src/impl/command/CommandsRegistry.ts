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

import {isUndoableType} from "../../api/undo/Undoable";
import {UndoHistory} from "../undo/UndoHistory";
import {Command, RegistrationPolicy} from "../../api/command/Command";
import {Subject, Observable} from "rxjs";
import {removeAt, remove} from "../util/ArrayUtil";

/**
 * A register of commands.
 * This is a singleton. It automatically collects the executed commands when the command is executed by an instrument.
 * The register has a limited size that can be changed.
 * It can notify handler about changes in the registry.
 */
export class CommandsRegistry {
    /**
     * The singleton.
     */
    private static instance: CommandsRegistry = new CommandsRegistry();

    public static setInstance(newInstance: CommandsRegistry): void {
        this.instance = newInstance;
    }

    public static getInstance(): CommandsRegistry {
        return this.instance;
    }

    /**
     * The saved commands.
     */
    private readonly cmds: Array<Command>;

    /**
     * The max number of cleanable commands (cf. Command::getRegistrationPolicy) that can contain the register.
     */
    private sizeMax: number;

    private readonly cmdPublisher: Subject<Command>;

    public constructor() {
        this.cmds = [];
        this.sizeMax = 50;
        this.cmdPublisher = new Subject();
    }

    /** An RX observable objects that will provide the commands produced by the binding. */
    public commands(): Observable<Command> {
        return this.cmdPublisher;
    }

    /**
     * @returns The stored commands. Cannot be null. Because of concurrency, you should not modify this list.
     */
    public getCommands(): ReadonlyArray<Command> {
        return this.cmds;
    }

    /**
     * Adds a command to the register.
     * Handlers are notified of the add of the given command. If Undoable, the command is
     * added to the undo collector as well.
     * @param cmd - The command to add. If null, nothing is done.
     */
    public addCommand(cmd: Command): void {
        if (!this.cmds.includes(cmd) &&
            (this.sizeMax > 0 || cmd.getRegistrationPolicy() === RegistrationPolicy.unlimited)) {

            // If there is too many commands in the register, the oldest removable command is removed and flushed.
            if (this.cmds.length >= this.sizeMax) {
                const command = this.cmds.find(a => a.getRegistrationPolicy() !== RegistrationPolicy.unlimited);

                if (command !== undefined) {
                    remove(this.cmds, command);
                    command.flush();
                }
            }

            this.cmds.push(cmd);
            this.cmdPublisher.next(cmd);

            if (isUndoableType(cmd)) {
                UndoHistory.getInstance().add(cmd);
            }
        }
    }

    /**
     * Removes the command from the register. The command is then flushed.
     * @param cmd - The command to remove.
     */
    public removeCommand(cmd: Command): void {
        remove(this.cmds, cmd);
        cmd.flush();
    }


    /**
     * Flushes and removes all the stored commands.
     */
    public clear(): void {
        this.cmds.forEach(cmd => {
            cmd.flush();
        });
        this.cmds.length = 0;
    }

    /**
     * Aborts the given command, i.e. the command is cancelled and removed from the register.
     * Handlers are then notified. The command is finally flushed.
     * @param cmd - The command to cancel.
     */
    public cancelCmd(cmd: Command): void {
        cmd.cancel();
        remove(this.cmds, cmd);
        cmd.flush();
    }

    /**
     * @returns The maximal number of commands that the register can contain.
     */
    public getSizeMax(): number {
        return this.sizeMax;
    }

    /**
     * Changes the number of commands that the register can contain.
     * In the case that commands have to be removed (because the new size is smaller than the old one),
     * the necessary number of the oldest and cleanable commands (cf. Command::getRegistrationPolicy)
     * are flushed and removed from the register.
     * @param newSizeMax - The max number of commands that can contain the register. Must be equal or greater than 0.
     */
    public setSizeMax(newSizeMax: number): void {
        if (newSizeMax >= 0) {
            let i = 0;
            let nb = 0;
            const toRemove: number = this.cmds.length - newSizeMax;

            while (nb < toRemove && i < this.cmds.length) {
                if (this.cmds[i].getRegistrationPolicy() === RegistrationPolicy.unlimited) {
                    i++;
                } else {
                    const removed = removeAt(this.cmds, i);
                    if (removed !== undefined) {
                        removed.flush();
                    }
                    nb++;
                }
            }
            this.sizeMax = newSizeMax;
        }
    }
}
