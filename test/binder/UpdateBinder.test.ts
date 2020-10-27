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

import {UpdateBinder} from "../../src/impl/binder/UpdateBinder";
import {Command} from "../../src/api/command/Command";
import {InteractionData} from "../../src/api/interaction/InteractionData";
import {mock} from "jest-mock-extended";
import {Interaction} from "../../src/api/interaction/Interaction";
import {BindingsObserver} from "../../src/api/binding/BindingsObserver";
import {Press} from "../../src/impl/interaction/library/Press";

let binder: UpdateBinder<Command, Interaction<InteractionData>, InteractionData>;

beforeEach(() => {
    binder = new UpdateBinder();
});

test("that is crashes when calling bind without an interaction supplier", () => {
    expect(() => binder.bind()).toThrow("The interaction supplier cannot be undefined here");
});

test("that is crashes when calling bind without a command supplier", () => {
    binder = binder.usingInteraction(() => mock<Interaction<InteractionData>>());
    expect(() => binder.bind()).toThrow("The command supplier cannot be undefined here");
});

test("that observer is used on bind", () => {
    const obs = mock<BindingsObserver>();
    binder = new UpdateBinder(obs)
        .usingInteraction(() => new Press())
        .toProduce(() => mock<Command>());

    const binding = binder.bind();
    expect(obs.observeBinding).toHaveBeenCalledTimes(1);
    expect(obs.observeBinding).toHaveBeenCalledWith(binding);
});

