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
 */
export interface Command {
    /**
     * Flushes the UI command.
     * The command must not be used after that.
     */
    flush(): void;

    /**
     * Executes (if possible) the commands.
     * @returns True: the command has been executed.
     */
    execute(): Promise<boolean> | boolean;

    /**
     * Checks whether the command can be executed.
     * @returns True if the command can be executed.
     */
    canExecute(): boolean;

    /**
     * State whether the execution of this command has effects on the system.
     * @returns True: the command has effects on the system.
     */
    hadEffect(): boolean;

    /**
     * Marks the command as "done" and sends it to the command registry.
     */
    done(): void;

    /**
     * To know whether the command has been marked as 'done'.
     * @returns True: the command has been marked as 'done'.
     */
    isDone(): boolean;

    /**
     * Marks the command has aborted.
     */
    cancel(): void;

    /**
     * Provides the status of the command.
     * @returns The status of the command.
     */
    getStatus(): CmdStatus;
}

/**
 * Defines the different states of the command.
 */
export type CmdStatus =
/** When the command has been cancelled. */
"cancelled" |
/** When the command is created but not executed yet. */
"created" |
/** When the command has been marked as done. */
"done" |
/** When the command has been created and executed one time. */
"executed" |
/** The command has been flushed. In this case, the command must not be used anymore. */
"flushed";
