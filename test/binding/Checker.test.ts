/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General export function License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General export function License for more details.
 * You should have received a copy of the GNU General export function License
 * along with Interacto.  If not, see <https://www.gnu.org/licenses/>.
 */

import type {Bindings, UndoHistory} from "../../src/interacto";
import {BindingsImpl, Checker, UndoHistoryImpl} from "../../src/interacto";

describe("binding checker", () => {
    let checker: Checker;
    let w1: unknown;
    let w2: unknown;
    let bindings: Bindings<UndoHistory>;

    beforeEach(() => {
        checker = new Checker();
        w1 = document.createElement("button");
        w2 = document.createElement("div");
        bindings = new BindingsImpl<UndoHistory>(new UndoHistoryImpl());
    });

    afterEach(() => {
        bindings.clear();
    });

    test("check same-interaction ok", () => {
        const b1 = bindings
            .clickBinder()
            .on(w1)
            .toProduceAnon(() => undefined)
            .bind();
        const b2 = bindings
            .clickBinder()
            .toProduceAnon(() => undefined)
            .on(w1, w2)
            .bind();

        checker.setLinterRules(["same-interactions", "err"]);

        expect(() => {
            checker.checkSameInteractions(b1, [b2]);
        }
        ).toThrow("[same-interactions] Two bindings use the same user interaction on same widget.");
    });

    test("check same-interaction no shared widgets", () => {
        const b1 = bindings
            .clickBinder()
            .on(w1)
            .toProduceAnon(() => undefined)
            .bind();
        const b2 = bindings
            .clickBinder()
            .toProduceAnon(() => undefined)
            .on(w2)
            .bind();

        checker.setLinterRules(["same-interactions", "err"]);

        expect(() => {
            checker.checkSameInteractions(b1, [b2]);
        }
        ).not.toThrow("[same-interactions] Two bindings use the same user interaction on same widget.");
    });

    test("check same-interaction not same interactions", () => {
        const b1 = bindings
            .clickBinder()
            .on(w1)
            .toProduceAnon(() => undefined)
            .bind();
        const b2 = bindings
            .clicksBinder(3)
            .toProduceAnon(() => undefined)
            .on(w2)
            .bind();

        checker.setLinterRules(["same-interactions", "err"]);

        expect(() => {
            checker.checkSameInteractions(b1, [b2]);
        }
        ).not.toThrow("[same-interactions] Two bindings use the same user interaction on same widget.");
    });

    test("check same-interaction with new binder linting configuration", () => {
        const b1 = bindings
            .clickBinder()
            .on(w1)
            .toProduceAnon(() => undefined)
            .configureRules("same-interactions", "ignore")
            .bind();
        const b2 = bindings
            .clickBinder()
            .toProduceAnon(() => undefined)
            .on(w1)
            .bind();

        checker.setLinterRules(["same-interactions", "err"]);

        expect(() => {
            checker.checkSameInteractions(b1, [b2]);
        }
        ).not.toThrow("[same-interactions] Two bindings use the same user interaction on same widget.");
    });

    test("check same-interaction with existing binder linting configuration", () => {
        const b1 = bindings
            .clickBinder()
            .on(w1)
            .toProduceAnon(() => undefined)
            .bind();
        const b2 = bindings
            .clickBinder()
            .configureRules("same-interactions", "ignore")
            .toProduceAnon(() => undefined)
            .on(w1)
            .bind();

        checker.setLinterRules(["same-interactions", "err"]);

        expect(() => {
            checker.checkSameInteractions(b1, [b2]);
        }
        ).not.toThrow("[same-interactions] Two bindings use the same user interaction on same widget.");
    });
});
