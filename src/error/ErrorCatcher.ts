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

import {ErrorNotifier} from "./ErrorNotifier";

/**
 * The singleton ErrorCatcher collects errors.
 * The ErrorCatcher sends the gathered exception to an ErrorNotifier (if one is defined).
 * @author Arnaud BLOUIN
 * @since 0.2
 */
export class ErrorCatcher {
    /**
     * The singleton.
     */
    public static INSTANCE: ErrorCatcher = new ErrorCatcher();

    /**
     * The notifier object.
     */
    private notifier: ErrorNotifier | undefined;

    private constructor() {
    }

    /**
     * Sets the notifier that will be notified about the collected exceptions.
     * @param {*} newNotifier The notifier that will be notified the collected exceptions. Can be null.
     * @since 0.2
     */
    public setNotifier(newNotifier: ErrorNotifier): void {
        this.notifier = newNotifier;
    }

    /**
     * @return {*} The notifier that is notified about the collected exceptions.
     * @since 0.2
     */
    public getErrorNotifier(): ErrorNotifier | undefined {
        return this.notifier;
    }

    /**
     * Gathers exceptions. The notifier is then notified of the exceptions (if defined).
     * @param {Error} exception The errors to gather.
     * @since 0.1
     */
    public reportError(exception: Error): void {
        if (this.notifier !== undefined) {
            this.notifier.onException(exception);
        }
    }
}
