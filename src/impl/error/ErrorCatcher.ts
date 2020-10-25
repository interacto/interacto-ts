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
import {Subject, Observable} from "rxjs";


/**
 * The singleton ErrorCatcher collects errors.
 * The ErrorCatcher sends the gathered exception to an ErrorNotifier (if one is defined).
 * @author Arnaud BLOUIN
 */
export class ErrorCatcher {
    private static instance: ErrorCatcher = new ErrorCatcher();

    public static setInstance(newInstance: ErrorCatcher): void {
        this.instance = newInstance;
    }

    /**
     * The single instance. Cannot be null.
     */
    public static getInstance(): ErrorCatcher {
        return this.instance;
    }

    /**
     * The notifier object.
     */
    private readonly notifier: Subject<Error>;

    public constructor() {
        this.notifier = new Subject();
    }

    /**
     * @return An observable stream of errors. Cannot be null.
     */
    public getErrors(): Observable<Error> {
        return this.notifier;
    }

    /**
     * Gathers exceptions. The notifier is then notified of the exceptions (if defined).
     * @param {Error} err The errors to gather.
     */
    public reportError(err: Error): void {
        this.notifier.next(err);
    }
}
