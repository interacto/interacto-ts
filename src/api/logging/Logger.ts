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
 * The logging system for Interacto
 */
export interface Logger {
    /**
     * States whether messages are logged in the command
     */
    writeConsole: boolean;

    /**
     * The HTTP address of the logging server
     */
    serverAddress: string | undefined;

    /**
     * The version of the app
     */
    readonly frontVersion: string | undefined;

    /**
     * The ID of the current session
     */
    readonly sessionID: string;

    /**
     * Logs interaction information messages.
     * The logging system does not decide the information messages to log.
     * This is the job of each interaction (and its FSM) in which we can
     * log information or not.
     * @param msg - The message to log
     * @param interactionName - The interaction name
     */
    logInteractionMsg(msg: string, interactionName?: string): void;

    /**
     * Logs binding information messages.
     * The logging system does not decide the information messages to log.
     * This is the job of each binding in which we can log information or not.
     * @param msg - The message to log
     * @param bindingName - The name of the binding to log
     */
    logBindingMsg(msg: string, bindingName?: string): void;

    logBindingStart(bindingName: string): void;

    logBindingEnd(bindingName: string, cancelled: boolean): void;

    /**
     * Logs command production information messages.
     * The logging system does not decide the information messages to log.
     * This is the job of each binding in which we can log command information or not.
     * @param msg - The message to log
     * @param cmdName - The name of the command
     */
    logCmdMsg(msg: string, cmdName?: string): void;

    /**
     * Logs interaction errors.
     * The logging system does not decide the information messages to log.
     * Errors are always logged in.
     * @param msg - The message to log
     * @param ex - The error
     * @param interactionName - The name of the interaction
     */
    logInteractionErr(msg: string, ex: unknown, interactionName?: string): void;

    /**
     * Logs binding errors.
     * The logging system does not decide the information messages to log.
     * Errors are always logged in.
     * @param msg - The message to log
     * @param ex - The error
     * @param bindingName - The name of the binding to log
     */
    logBindingErr(msg: string, ex: unknown, bindingName?: string): void;

    /**
     * Logs command errors.
     * The logging system does not decide the information messages to log.
     * Errors are always logged in.
     * @param msg - The message to log
     * @param ex - The error
     * @param cmdName - The name of the command
     */
    logCmdErr(msg: string, ex: unknown, cmdName?: string): void;
}
