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
     * Flushes the command.
     * Can be useful to close streams, free objects, etc.
     * A command should flushed manually only when it is not managed by the command registry of the application.
     * When a command is gathered and managed by a command registry, it is automatically flushed when the
     * command registry removes the command.
     */
    flush(): void;

    /**
     * Specifies whether the command must be saved in the command register. For instance,
     * some commands, such as a scroll, should not be saved or put in the undo/redo manager. Such commands should not be registrable.
     * @return The registration policy.
     */
    getRegistrationPolicy(): RegistrationPolicy;

    /**
     * This method manages the execution of the command.
     * @return {boolean} True: the execution of the command is OK.
     */
    doIt(): boolean;

    /**
     * Checks whether the command can be executed.
     * @return {boolean} True if the command can be executed.
     * @since 0.1
     */
    canDo(): boolean;

    /**
     * State whether the execution of this command has effects on the system.
     * @return {boolean} True: the command has effects on the system.
     */
    hadEffect(): boolean;

    /**
     * Checks whether the current command can be cancelled by the given one.
     * @param {*} cmd The command to check whether it can cancel the current command.
     * @return {boolean} True: The given command can cancel the current command.
     */
    unregisteredBy(cmd: Command): boolean;

    /**
     * Marks the command as "done" and sends it to the command registry.
     * @since 0.1
     */
    done(): void;

    /**
     * To know whether the command has been marked as 'done'.
     * @return {boolean} True: the command has been marked as 'done'.
     */
    isDone(): boolean;

    /**
     * Marks the command has aborted.
     */
    cancel(): void;

    /**
     * Provides the status of the command.
     * @return The status of the command.
     * @since 0.2
     */
    getStatus(): CmdStatus;
}

/**
 * Defines the registration policy of the command.
 * @enum
 * @property {RegistrationPolicy} NONE
 * The command is never registered.
 * @property {RegistrationPolicy} UNLIMITED
 * The command is registered in the command register. The command is not flushed when the registry wants to free some commands.
 * @property {RegistrationPolicy} LIMITED
 * The command is registered in the command register. The command can be flushed by the registry.
 * @class
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
 * @since 0.2
 * @enum
 * @property {CmdStatus} CREATED
 * When the command is created but not executed yet.
 * @property {CmdStatus} EXECUTED
 * When the command has been created and executed one time.
 * @property {CmdStatus} CANCELLED
 * When the command has been cancelled.
 * @property {CmdStatus} DONE
 * When the command has been marked as done.
 * @property {CmdStatus} FLUSHED
 * The command has been flushed. In this case, the command must not be used anymore.
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
