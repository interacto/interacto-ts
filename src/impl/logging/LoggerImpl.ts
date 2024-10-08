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

/**
 * The logging item
 * @category Logging
 */
export class LoggingData {
    public readonly name: string;

    public readonly sessionID: string;

    public readonly date: number;

    public readonly msg: string;

    public readonly level: LogLevel;

    public readonly type: "ERR" | "INFO";

    public readonly stack: string | undefined;

    public readonly frontVersion: string | undefined;

    public constructor(date: number, msg: string, level: LogLevel, name: string, type: "ERR" | "INFO",
                       sessionID: string, stack?: string, frontVersion?: string) {
        this.frontVersion = frontVersion;
        this.stack = stack;
        this.sessionID = sessionID;
        this.type = type;
        this.name = name;
        this.level = level;
        this.msg = msg;
        this.date = date;
    }

    public toString(): string {
        const withstack = this.stack === undefined ? "" : `, ${this.stack}`;
        const withversion = this.frontVersion === undefined ? "" : ` ${this.frontVersion}`;
        return `${this.type}${withversion} [${this.sessionID}] [${this.level}:${this.name}] at ${this.date.toString()}: '${this.msg}'${withstack}`;
    }
}

/**
 * A logging usage item
 * @category Logging
 */
export class UsageLog {
    public name: string;

    public readonly sessionID: string;

    public readonly date: number;

    public duration: number;

    public cancelled: boolean;

    public readonly frontVersion: string | undefined;

    public constructor(name: string, sessionID: string, date: number, frontVersion?: string) {
        this.frontVersion = frontVersion;
        this.date = date;
        this.sessionID = sessionID;
        this.name = name;
        this.duration = 0;
        this.cancelled = false;
    }

    public toString(): string {
        const withversion = this.frontVersion === undefined ? "" : ` v:${this.frontVersion}`;
        return `Usage.${withversion} id:${this.sessionID} binding:${this.name} ` +
          `date:${this.date.toString()} duration:${this.duration.toString()} cancelled:${String(this.cancelled)}`;
    }
}

/**
 * An implementation of the logger
 * @category Logging
 */
export class LoggerImpl implements Logger {
    public writeConsole: boolean;

    public serverAddress: string | undefined;

    public readonly sessionID: string;

    public readonly frontVersion: string | undefined;

    public ongoingBindings: Array<UsageLog>;

    public constructor(version?: string) {
        this.frontVersion = version;
        this.ongoingBindings = [];
        this.serverAddress = undefined;
        this.writeConsole = true;
        this.sessionID = Date.now().toString(36) + Math.random().toString(36)
            .slice(2, 8);
    }

    private processLoggingData(data: LoggingData): void {
        if (this.writeConsole) {
            // eslint-disable-next-line no-console
            console.log(data.toString());
        }

        if (this.serverAddress !== undefined && data.type === "ERR") {
            const rq = new XMLHttpRequest();
            rq.open("POST", `${this.serverAddress}/api/err`, true);
            rq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            rq.send(JSON.stringify(data));
        }
    }

    private formatError(ex: unknown): string {
        if (ex instanceof Error) {
            return `${ex.message} ${ex.stack ?? ""}`;
        }
        return String(ex);
    }

    public logBindingErr(msg: string, ex: unknown, bindingName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "binding", bindingName, "ERR", this.sessionID, this.formatError(ex), this.frontVersion));
    }

    public logBindingMsg(msg: string, bindingName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "binding", bindingName, "INFO",
            this.sessionID, undefined, this.frontVersion));
    }

    public logCmdErr(msg: string, ex: unknown, cmdName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "command", cmdName, "ERR", this.sessionID, this.formatError(ex), this.frontVersion));
    }

    public logCmdMsg(msg: string, cmdName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "command", cmdName, "INFO",
            this.sessionID, undefined, this.frontVersion));
    }

    public logInteractionErr(msg: string, ex: unknown, interactionName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg,
            "interaction", interactionName, "ERR", this.sessionID, this.formatError(ex), this.frontVersion));
    }

    public logInteractionMsg(msg: string, interactionName = ""): void {
        this.processLoggingData(new LoggingData(performance.now(), msg, "interaction", interactionName, "INFO",
            this.sessionID, undefined, this.frontVersion));
    }

    public logBindingStart(bindingName: string): void {
        this.ongoingBindings.push(new UsageLog(bindingName, this.sessionID, performance.now(), this.frontVersion));
    }

    public logBindingEnd(bindingName: string, cancelled: boolean): void {
        const logs = this.ongoingBindings.filter(bind => bindingName.includes(bind.name));

        // Removing these logs
        this.ongoingBindings = this.ongoingBindings.filter(bind => !logs.includes(bind));

        if (logs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const log = logs[0]!;
            log.name = bindingName;
            log.duration = performance.now() - log.date;
            log.cancelled = cancelled;

            if (this.writeConsole) {
                // eslint-disable-next-line no-console
                console.log(log.toString());
            }

            if (this.serverAddress !== undefined) {
                const rq = new XMLHttpRequest();
                rq.open("POST", `${this.serverAddress}/api/usage`, true);
                rq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                rq.send(JSON.stringify(log));
            }
        }
    }
}
