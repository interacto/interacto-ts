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
                       public readonly name: string, public readonly type: "ERR" | "INFO",
                       // eslint-disable-next-line @typescript-eslint/no-parameter-properties
                       public readonly sessionID: string, public readonly stack?: string) {
    }

    public toString(): string {
        const withstack = this.stack === undefined ? "" : `, ${this.stack}`;
        return `${this.type}[${this.level}: ${this.name}] [${this.sessionID}] at ${this.date}: '${this.msg}'${withstack}`;
    }
}

export class UsageLog {
    public duration: number;

    public cancelled: boolean;

    // eslint-disable-next-line @typescript-eslint/no-parameter-properties
    public constructor(public name: string, public readonly sessionID: string, public readonly date: number) {
        this.duration = 0;
        this.cancelled = false;
    }
}


export class LoggerImpl implements Logger {
    public writeConsole: boolean;

    public serverAddress: string | undefined;

    public readonly sessionID: string;

    public ongoingBindings: Array<UsageLog>;

    public constructor() {
        this.ongoingBindings = [];
        this.serverAddress = undefined;
        this.writeConsole = true;
        this.sessionID = Date.now().toString(36) + Math.random().toString(36)
            .substr(2, 6);
    }

    private processLoggingData(data: LoggingData): void {
        if (this.writeConsole) {
            // eslint-disable-next-line no-console
            console.log(data.toString());
        }

        if (this.serverAddress !== undefined && data.type === "ERR") {
            const rq = new XMLHttpRequest();
            rq.open("POST", this.serverAddress, true);
            rq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            rq.send(JSON.stringify({
                "date": data.date,
                "msg": data.msg,
                "stack": data.stack,
                "id": data.sessionID
            }));
        }
    }

    private formatError(ex: unknown): string {
        if (ex instanceof Error) {
            return `${ex.message} ${ex.stack ?? ""}`;
        }
        return String(ex);
    }

    public logBindingErr(msg: string, ex: unknown, bindingName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "binding", bindingName, "ERR", this.sessionID, this.formatError(ex)));
    }

    public logBindingMsg(msg: string, bindingName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "binding", bindingName, "INFO", this.sessionID));
    }

    public logCmdErr(msg: string, ex: unknown, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "command", cmdName, "ERR", this.sessionID, this.formatError(ex)));
    }

    public logCmdMsg(msg: string, cmdName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "command", cmdName, "INFO", this.sessionID));
    }

    public logInteractionErr(msg: string, ex: unknown, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "interaction", interactionName, "ERR", this.sessionID, this.formatError(ex)));
    }

    public logInteractionMsg(msg: string, interactionName: string = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "interaction", interactionName, "INFO", this.sessionID));
    }

    public logBindingStart(bindingName: string): void {
        this.ongoingBindings.push(new UsageLog(bindingName, this.sessionID, performance.now()));
    }

    public logBindingEnd(bindingName: string, cancelled: boolean): void {
        const logs = this.ongoingBindings.filter(d => bindingName.includes(d.name));

        this.ongoingBindings = this.ongoingBindings.filter(d => !logs.includes(d));

        if (logs.length === 1) {
            logs[0].name = bindingName;
            logs[0].duration = logs[0].date - performance.now();
            logs[0].cancelled = cancelled;
        }
    }
}