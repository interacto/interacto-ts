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
                       public readonly name: string, public readonly type: "ERR" | "INFO") {
    }

    public toString(): string {
        return `${this.type} ${this.date} [${this.level}: ${this.name}] ${this.msg}`;
    }
}


export class LoggerImpl implements Logger {
    public writeConsole: boolean;

    public constructor() {
        this.writeConsole = true;
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
            "binding", "", "ERR"));
    }

    public logBindingMsg(msg: string): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "binding", "", "INFO"));
    }

    public logCmdErr(msg: string, ex: unknown, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), `${msg} ${this.formatError(ex)}`,
            "command", cmdName, "ERR"));
    }

    public logCmdMsg(msg: string, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "command", cmdName, "INFO"));
    }

    public logInteractionErr(msg: string, ex: unknown, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), `${msg} ${this.formatError(ex)}`,
            "interaction", interactionName, "ERR"));
    }

    public logInteractionMsg(msg: string, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "interaction", interactionName, "INFO"));
    }

}
