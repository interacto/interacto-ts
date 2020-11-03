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
import {Subscription} from "rxjs";
import {
    CommandsRegistry,
    FSM,
    Interaction, InteractionBase,
    InteractionData,
    tapBinder,
    UndoCollector,
    WidgetBinding
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {createTouchEvent} from "../interaction/StubEvents";

let binding: WidgetBinding<StubCmd, Interaction<InteractionData>, InteractionData> | undefined;
let cmd: StubCmd;
let producedCmds: Array<StubCmd>;
let disposable: Subscription | undefined;

beforeEach(() => {
    jest.useFakeTimers();
    cmd = new StubCmd(true);
    producedCmds = [];
});

afterEach(() => {
    disposable?.unsubscribe();
    binding?.uninstallBinding();
    CommandsRegistry.getInstance().clear();
    UndoCollector.getInstance().clear();
});

describe("on canvas", () => {
    let c1: HTMLElement;

    beforeEach(() => {
        c1 = document.createElement("canvas");
    });

    test("run tap produces cmd", () => {
        binding = tapBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));

        expect(binding).toBeDefined();
        expect(cmd.exec).toStrictEqual(1);
        expect(producedCmds).toHaveLength(1);
        expect(producedCmds[0]).toBe(cmd);
    });


    test("run tap two times recycle events", () => {
        binding = tapBinder(2)
            .toProduce(() => new StubCmd(true))
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        c1.dispatchEvent(createTouchEvent("touchstart", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchstart", 2, c1, 31, 13, 310, 130));
        c1.dispatchEvent(createTouchEvent("touchend", 2, c1, 31, 13, 310, 130));

        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(2);
    });

    test("unsubscribe does not trigger the binding", () => {
        binding = tapBinder(2)
            .toProduce(() => cmd)
            .on(c1)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        (binding.getInteraction() as InteractionBase<InteractionData, FSM>).onNodeUnregistered(c1);

        c1.dispatchEvent(createTouchEvent("touchend", 1, c1, 11, 23, 110, 230));

        expect(binding.isRunning()).toBeFalsy();
    });
});

describe("on svg doc for dynamic registration", () => {
    let doc: HTMLElement;

    beforeEach(() => {
        doc = document.createElement("svg");
    });

    test("dynamic registration with nothing added", () => {
        binding = tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        doc.dispatchEvent(createTouchEvent("touchend", 1, doc, 11, 23, 110, 230));

        expect(binding.isRunning()).toBeFalsy();
        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(0);
    });

    test("dynamic registration with a node added", async () => {
        binding = tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(1);
    });

    test("dynamic registration with a node already added", async () => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);

        // Waiting for the mutation changes to be done.
        await Promise.resolve();

        binding = tapBinder(2)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(1);
    });

    test("dynamic registration with a node added and removed", async () => {
        binding = tapBinder(1)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);
        await Promise.resolve();

        doc.removeChild(rect);
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(0);
    });

    test("dynamic registration with a node already added then removed", async () => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        doc.appendChild(rect);
        await Promise.resolve();

        binding = tapBinder(3)
            .toProduce(() => cmd)
            .onDynamic(doc)
            .bind();
        disposable = binding.produces().subscribe(c => producedCmds.push(c));

        doc.removeChild(rect);
        await Promise.resolve();

        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));
        rect.dispatchEvent(createTouchEvent("touchend", 1, rect, 11, 23, 110, 230));

        expect(binding).toBeDefined();
        expect(producedCmds).toHaveLength(0);
    });
});

