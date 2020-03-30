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

/**
 * A command is produced and executed in reaction of a user interaction.
 * It follows the command design pattern.
 * It contains statements to execute to perform the command.
 * The interface Undoable can be used to add undo/redo features to a command.
 * @author Arnaud Blouin
 */
export interface Command {
    /**
     * Flushes the UI command.
     * The command must not be used after that.
     */
    flush(): void;

    /**
     * Specifies whether the command must be saved in the command register. For instance,
     * some commands, such as a scroll, should not be saved or put in the undo/redo manager. Such commands should not be registrable.
     * @return The registration policy.
     */
    getRegistrationPolicy(): RegistrationPolicy;

    /**
     * Executes (if possible) the commands.
     * @return True: the command has been executed.
     */
    doIt(): boolean;

    /**
     * Checks whether the command can be executed.
     * @return True if the command can be executed.
     */
    canDo(): boolean;

    /**
     * State whether the execution of this command has effects on the system.
     * @return True: the command has effects on the system.
     */
    hadEffect(): boolean;

    /**
     * Checks whether the current command can be cancelled by the given one.
     * @param cmd The command to check whether it can cancel the current command.
     * @return True: The given command can cancel the current command.
     */
    unregisteredBy(cmd: Command): boolean;

    /**
     * Marks the command as "done" and sends it to the command registry.
     */
    done(): void;

    /**
     * To know whether the command has been marked as 'done'.
     * @return True: the command has been marked as 'done'.
     */
    isDone(): boolean;

    /**
     * Marks the command has aborted.
     */
    cancel(): void;

    /**
     * Provides the status of the command.
     * @return The status of the command.
     */
    getStatus(): CmdStatus;
}

/**
 * Defines the registration policy of the command.
 */
export enum RegistrationPolicy {
    /**
     * The command is never registered.
     */
    NONE,
    /**
     * The command is registered in the command register. The command is not flushed when the registry wants to free some commands.
     */
    UNLIMITED,
    /**
     * The command is registered in the command register. The command can be flushed by the registry.
     */
    LIMITED
}

/**
 * Defines the different states of the command.
 */
export enum CmdStatus {
    /**
     * When the command is created but not executed yet.
     */
    CREATED,
    /**
     * When the command has been created and executed one time.
     */
    EXECUTED,
    /**
     * When the command has been cancelled.
     */
    CANCELLED,
    /**
     * When the command has been marked as done.
     */
    DONE,
    /**
     * The command has been flushed. In this case, the command must not be used anymore.
     */
    FLUSHED
}
