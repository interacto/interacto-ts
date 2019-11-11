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
import { ErrorCatcher } from "../../src";

let instance: ErrorCatcher;

beforeEach(() => {
    instance = new ErrorCatcher();
});

test("testGetSetInstanceOK", () => {
    const newinstance = new ErrorCatcher();
    ErrorCatcher.setInstance(newinstance);
    expect(ErrorCatcher.getInstance()).toBe(newinstance);
});

test("testErrors", () => {
    const errors = new Array<Error>();
    const errorStream = instance.getErrors().subscribe(err => errors.push(err));
    const error = new Error();
    instance.reportError(error);
    errorStream.unsubscribe();
    expect(errors.length).toEqual(1);
    expect(errors[0]).toBe(error);
});
