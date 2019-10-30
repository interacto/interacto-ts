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
 * The singleton ErrorCatcher collects errors.
 * The ErrorCatcher sends the gathered exception to an ErrorNotifier (if one is defined).
 * @author Arnaud BLOUIN
 */
export class ErrorCatcher {
    /**
     * The singleton.
     */
    public static INSTANCE: ErrorCatcher = new ErrorCatcher();

    /**
     * The notifier object.
     */
    private notifier: ((err: Error) => void) | undefined;

    private constructor() {
    }

    /**
     * Sets the notifier that will be notified about the collected exceptions.
     * @param {*} newNotifier The notifier that will be notified the collected exceptions. Can be undefined.
     */
    public setNotifier(newNotifier: ((err: Error) => void) | undefined): void {
        this.notifier = newNotifier;
    }

    /**
     * @return {*} The notifier that is notified about the collected exceptions.
     */
    public getErrorNotifier(): ((err: Error) => void) | undefined {
        return this.notifier;
    }

    /**
     * Gathers exceptions. The notifier is then notified of the exceptions (if defined).
     * @param {Error} exception The errors to gather.
     */
    public reportError(exception: Error): void {
        if (this.notifier !== undefined) {
            this.notifier(exception);
        }
    }
}
