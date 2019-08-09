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

import {isUndoableType} from "../undo/Undoable";
import {UndoCollector} from "../undo/UndoCollector";
import {MArray} from "../../util/ArrayUtil";
import {Command, RegistrationPolicy} from "./Command";
import {CommandHandler} from "./CommandHandler";

/**
 * A register of commands.
 * This is a singleton. It automatically collects the executed commands when the command is executed by an instrument.
 * The register has a limited size that can be changed.
 * It can notify handler about changes in the registry.
 * @author Arnaud Blouin
 * @class
 */
export class CommandsRegistry {
    /**
     * The singleton.
     */
    public static readonly INSTANCE: CommandsRegistry = new CommandsRegistry();

    /**
     * The saved commands.
     */
    private readonly cmds: MArray<Command>;

    /**
     * The commands handler.
     */
    private readonly handlers: MArray<CommandHandler>;

    /**
     * The max number of cleanable commands (cf. Action::getRegistrationPolicy) that can contain the register.
     */
    private sizeMax: number;

    constructor() {
        this.cmds = new MArray();
        this.handlers = new MArray();
        this.sizeMax = 50;
    }

    public getHandlers(): Array<CommandHandler> {
        return [...this.handlers];
    }

    /**
     * Notifies handler that a command has been executed.
     * @param {*} cmd The executed command.
     */
    public onActionExecuted(cmd: Command): void {
        this.handlers.forEach(handler => handler.onCmdExecuted(cmd));
    }

    /**
     * Notifies handler that a command ends.
     * @param {*} cmd The ending command.
     */
    public onActionDone(cmd: Command): void {
        this.handlers.forEach(handler => handler.onCmdDone(cmd));
    }

    /**
     * @return {*[]} The stored commands. Cannot be null. Because of concurrency, you should not modify this list.
     */
    public getActions(): Array<Command> {
        return this.cmds;
    }

    /**
     * Removes and flushes the commands from the register that use the given command type.
     * @see Action::unregisteredBy
     * @param {*} cmd The command that may cancels others.
     */
    public unregisterCmd(cmd: Command): void {
        let i = 0;
        while ((i < this.cmds.length)) {
            if (this.cmds[i].unregisteredBy(cmd)) {
                const delAction = this.cmds.removeAt(i);
                if (delAction !== undefined) {
                    delAction.flush();
                }
            } else {
                i++;
            }
        }
    }

    /**
     * Adds a command to the register. Before being added, the given command is used to cancel commands
     * already added. Handlers are notified of the add of the given command. If Undoable, the command is
     * added to the undo collector as well.
     * @param {*} cmd The command to add. If null, nothing is done.
     * @param {*} cmdHandler The handler that produced or is associated to the command. If null, nothing is done.
     */
    public addCommand(cmd: Command, cmdHandler?: CommandHandler): void {
        if (this.cmds.indexOf(cmd) < 0 &&
            (this.sizeMax > 0 || cmd.getRegistrationPolicy() === RegistrationPolicy.UNLIMITED)) {
            this.unregisterCmd(cmd);

            // If there is too many commands in the register, the oldest removable command is removed and flushed.
            if (this.cmds.length >= this.sizeMax) {
                const command = this.cmds.find(a => a.getRegistrationPolicy() !== RegistrationPolicy.UNLIMITED);

                if (command !== undefined) {
                    this.cmds.remove(command);
                    command.flush();
                }
            }

            this.cmds.push(cmd);

            this.handlers.forEach(handler => handler.onCmdAdded(cmd));

            if (isUndoableType(cmd)) {
                UndoCollector.INSTANCE.add(cmd, cmdHandler);
            }
        }
    }

    /**
     * Removes the command from the register. The command is then flushed.
     * @param {*} cmd The command to remove.
     */
    public removeAction(cmd: Command): void {
        this.cmds.remove(cmd);
        cmd.flush();
    }

    /**
     * Adds a command handler.
     * @param {*} handler The handler to add.
     */
    public addHandler(handler: CommandHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Removes the given handler.
     * @param {*} handler The handler to remove.
     */
    public removeHandler(handler: CommandHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Removes all the command handler.
     */
    public removeAllHandlers(): void {
        this.handlers.clear();
    }

    /**
     * Flushes and removes all the stored commands.
     */
    public clear(): void {
        this.cmds.forEach(cmd => cmd.flush());
        this.cmds.clear();
    }

    /**
     * Aborts the given command, i.e. the command is cancelled and removed from the register.
     * Handlers are then notified. The command is finally flushed.
     * @param {*} cmd The command to cancel.
     */
    public cancelAction(cmd: Command): void {
        cmd.cancel();
        this.cmds.remove(cmd);
        this.handlers.forEach(handler => handler.onCmdCancelled(cmd));
        cmd.flush();
    }

    /**
     * @return {number} The maximal number of commands that the register can contain.
     */
    public getSizeMax(): number {
        return this.sizeMax;
    }

    /**
     * Changes the number of commands that the register can contain.
     * In the case that commands have to be removed (because the new size is smaller than the old one),
     * the necessary number of the oldest and cleanable commands (cf. Action::getRegistrationPolicy)
     * are flushed and removed from the register.
     * @param {number} newSizeMax The max number of commands that can contain the register. Must be equal or greater than 0.
     */
    public setSizeMax(newSizeMax: number): void {
        if (newSizeMax >= 0) {
            let i = 0;
            let nb = 0;
            const toRemove: number = this.cmds.length - newSizeMax;

            while (nb < toRemove && i < this.cmds.length) {
                if (this.cmds[i].getRegistrationPolicy() !== RegistrationPolicy.UNLIMITED) {
                    const removed = this.cmds.removeAt(i);
                    if (removed !== undefined) {
                        removed.flush();
                    }
                    nb++;
                } else {
                    i++;
                }
            }
            this.sizeMax = newSizeMax;
        }
    }
}
