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

import type {Logger} from "../../api/logging/Logger";
import type {LogLevel} from "../../api/logging/LogLevel";

export class LoggingData {
    // eslint-disable-next-line @typescript-eslint/no-parameter-properties
    public constructor(public readonly date: number, public readonly msg: string, public readonly level: keyof typeof LogLevel,
                       // eslint-disable-next-line @typescript-eslint/no-parameter-properties
                       public readonly name: string, public readonly type: "ERR" | "INFO", public readonly sessionID: string) {
    }

    public toString(): string {
        return `${this.type}[${this.level}: ${this.name}] [${this.sessionID}] at ${this.date}: '${this.msg}'`;
    }
}


export class LoggerImpl implements Logger {
    public writeConsole: boolean;

    public readonly sessionID: string;

    public constructor() {
        this.writeConsole = true;
        this.sessionID = Date.now().toString(36) + Math.random().toString(36)
            .substr(2, 6);
    }

    private processLoggingData(data: LoggingData): void {
        if (this.writeConsole) {
            // eslint-disable-next-line no-console
            console.log(data.toString());
        }
    }

    private formatError(ex: unknown): string {
        if (ex instanceof Error) {
            return `${ex.message} ${ex.stack ?? ""}`;
        }
        return String(ex);
    }

    public logBindingErr(msg: string, ex: unknown): void {
        this.processLoggingData(new LoggingData(performance.now(), `${msg} ${this.formatError(ex)}`,
            "binding", "", "ERR", this.sessionID));
    }

    public logBindingMsg(msg: string): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "binding", "", "INFO", this.sessionID));
    }

    public logCmdErr(msg: string, ex: unknown, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), `${msg} ${this.formatError(ex)}`,
            "command", cmdName, "ERR", this.sessionID));
    }

    public logCmdMsg(msg: string, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "command", cmdName, "INFO", this.sessionID));
    }

    public logInteractionErr(msg: string, ex: unknown, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), `${msg} ${this.formatError(ex)}`,
            "interaction", interactionName, "ERR", this.sessionID));
    }

    public logInteractionMsg(msg: string, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "interaction", interactionName, "INFO", this.sessionID));
    }

}
