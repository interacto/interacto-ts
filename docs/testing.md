# Interacto Test‑Writing Guide

**Version**: 8.2.0  
**Generated on**: 2026‑10‑08

---

## 1. Purpose & Scope
This guide documents the conventions, tooling, and patterns used throughout the **interacto‑ts** repository so that new tests (or an AI‑agent that generates them) are consistent with the existing code base. It covers:
- Project layout and file naming
- Required license header and imports
- Test framework configuration and quality gates
- Common test‑writing patterns for each domain (FSM, Interaction, Binder, Command, History, etc.)
- Checklist to satisfy lint, type‑checking, coverage, and mutation‑testing requirements.

---

## 2. Stack & Tooling
| Tool | Version (as of this repo) | Role |
|------|--------------------------|------|
| **Vitest** | 4.1.5 | Test runner (`vitest.config.ts`). Uses `jsdom` environment, `vmThreads` pool, and the **v8** coverage provider. |
| **vitest‑mock‑extended** | 4.0.0 | Typed mock creation (`mock<T>()`). |
| **interacto‑nono** | 0.6.0 | Robot helper (`robot()`) that simulates DOM events. |
| **RxJS** | 7.8.2 | Used by certain tests (e.g., `LinearHistory` with `TestScheduler`). |
| **ESLint** | 10.2.1 (plus many plugins) | Linting for both `src` and `test`. |
| **Stryker Mutator** | 9.6.1 | Mutation testing (`npm run mutation`). |
| **TypeScript** | 6.0.3 | Compile‑time checks; `tsconfig.test.json` points to `test/**/*.ts`. |

### 2.1 Running the test suite
```bash
# Normal unit tests + coverage
npm test                # equivalent to "vitest --run"
npm run coverage        # runs vitest with coverage thresholds

# Lint and type‑checking (executed in pre‑build)
npm run lint
npm run compile-test    # tsc compilation of the test files
```
> **Quality gates** – The project enforces minimum coverage thresholds (see `vitest.config.ts`):
> - branches ≥ 80 %
> - functions ≥ 90 %
> - lines ≥ 90 %
> - statements ≥ 90 %
> If any of these fall below the threshold, the CI fails.

---

## 3. Repository Layout & Naming Conventions
```
interacto-ts/
├─ src/          # Production code – API + implementation
│   ├─ api/      # Public interfaces (command, fsm, interaction, …)
│   └─ impl/     # Private implementations
├─ test/         # All test files – mirror the src tree
│   ├─ binder/
│   ├─ binding/
│   ├─ command/
│   │   └─ library/
│   ├─ fsm/
│   ├─ history/
│   ├─ interaction/
│   │   └─ library/
│   ├─ logging/
│   └─ util/
├─ docs/         # Documentation (this guide lives in docs/testing.md)
└─ ...
```
- **Test file names** must end with `.test.ts` (e.g., `Tap.test.ts`).
- Tests import the **barrel** `../../src/interacto` rather than deep module paths – this simplifies imports and guarantees public API exposure.
- Each test file starts with the mandatory GPL‑3.0 header (see any existing file for the exact text).
- Helper files that live next to the tests (e.g., `Utils.ts`, `StubEvents.ts`, `StubCmd.ts`) also contain the GPL header and are imported using relative paths.

---

## 4. License Header & Imports (required at the top of every test file)
```typescript
/*
 * This file is part of Interacto.
 * Interacto is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * Interacto is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */

import { /* public symbols */ } from "../../src/interacto";
// optional test‑specific helpers
import { robot } from "../interaction/StubEvents";
import { checkTouchPoint, flushPromises } from "../Utils";
```
> **Do not** import from `src/api/...` or `src/impl/...` directly; always go through the barrel.

---

## 5. Test Structure & Style
| Aspect | Recommended practice |
|--------|----------------------|
| **Top‑level `describe`** | One `describe` per file, named *using a …* (e.g., `describe("using a Tap interaction", …)`). |
| **Test function** | Use `test` **only** (the ESLint rule `vitest/consistent-test-it` enforces `fn: "test"`). |
| **Setup / teardown** | Prefer `beforeEach` / `afterEach`. Use `vi.useFakeTimers()` when you need deterministic timing, and always restore timers (`vi.clearAllTimers()`). |
| **Mocks** | `mock<T>()` from `vitest-mock-extended` for interfaces. Use `vi.spyOn` for specific methods. |
| **Assertions** | - Equality: `expect(...).toStrictEqual(...)` or `toBe(...)` for primitives. <br>- Booleans: `toBeTruthy()` / `toBeFalsy()`. <br>- Errors: `expect(() => fn()).toThrow(ErrorMessage)`. <br>- Mock calls: `toHaveBeenCalledTimes(n)`, `not.toHaveBeenCalled()`. |
| **Async helpers** | `flushPromises()` (defined in `test/Utils.ts`) to let pending promises settle, `await` on async commands. |
| **Event factories** | Use helpers from `test/interaction/StubEvents.ts` (`createMouseEvent`, `createTouchEvent`, `createKeyEvent`, `createWheelEvent`). |
| **Robot** | `robot(target).touchstart(...).touchend()` etc. – chainable, automatically registers events on the target element. |
| **Custom checkers** | `checkTouchPoint(touch, lx, ly, sx, sy, id, element)` – validates a `TouchData` object against expected values. |
| **Indentation** | 4 spaces (enforced by the `@stylistic/indent` rule). |
| **Quotes** | Double quotes (`"`). |
| **Line length** | ≤ 150 characters (`max‑len` rule). |
| **No magic numbers** | The rule is turned off, but keep numbers meaningful and comment when needed. |

---

## 6. Domain‑Specific Patterns
The following sections summarise the typical pattern for each major domain. Copy‑paste the skeleton and adapt the concrete classes/values.

### 6.1 FSM (`test/fsm/*.test.ts`)
```typescript
import {
    FSMImpl, InitState, StdState, CancelFSMError, TimeoutTransition,
    SubFSMTransitionImpl,
} from "../../src/interacto";
import {mock} from "vitest-mock-extended";
import {createMouseEvent, createKeyEvent, createTouchEvent} from "../interaction/StubEvents";
import {beforeEach, describe, expect, test, vi} from "vitest";

let fsm: FSMImpl;
let handler = mock<FSMHandler>();

beforeEach(() => {
    fsm = new FSMImpl(mock<Logger>());
    handler = mock<FSMHandler>();
    fsm.addHandler(handler);
});

test("init state is created", () => {
    expect(fsm.states).toHaveLength(1);
    expect(fsm.states[0]).toBeInstanceOf(InitState);
});

// Example of a transition test using a stub transition
import {StubTransitionOK} from "./StubTransitionOk";

test("custom transition fires on click", () => {
    const stateA = fsm.addStdState("A");
    const stateB = fsm.addStdState("B");
    new StubTransitionOK(stateA, stateB, true);
    fsm.process(createMouseEvent("click", document.createElement("button")));
    expect(fsm.currentState).toBe(stateB);
    expect(handler.fsmStarts).toHaveBeenCalled();
});
```
**Key points**
- Create the FSM with a mocked `Logger`.
- Use `fsm.addStdState` or `fsm.addCancellingState` to build the graph.
- `StubTransitionOK` (or its subclasses) is the usual lightweight transition.
- Verify handler callbacks (`fsmStarts`, `fsmStops`, `fsmUpdates`, `fsmCancels`).
- Use `vi.useFakeTimers()` when testing `TimeoutTransition`.

---

### 6.2 Interaction (`test/interaction/*.test.ts`)
```typescript
import {Tap, TouchDataImpl} from "../../../src/interacto";
import {robot} from "../StubEvents";
import {checkTouchPoint} from "../../Utils";
import {mock} from "vitest-mock-extended";
import {beforeEach, describe, expect, test, vi} from "vitest";

let interaction: Tap;
let canvas: HTMLElement;
let handler: FSMHandler & MockProxy<FSMHandler>;
let logger: Logger & MockProxy<Logger>;

beforeEach(() => {
    vi.useFakeTimers();
    handler = mock<FSMHandler>();
    logger = mock<Logger>();
    canvas = document.createElement("canvas");
    interaction = new Tap(logger);
    interaction.fsm.addHandler(handler);
    interaction.registerToNodes([canvas]);
});

afterEach(() => {
    interaction.uninstall();
    vi.clearAllMocks();
    vi.clearAllTimers();
});

test("single touchstart triggers start", () => {
    robot(canvas).touchstart({}, [{ identifier: 1 }]);
    expect(handler.fsmStarts).toHaveBeenCalledTimes(1);
    expect(handler.fsmUpdates).toHaveBeenCalledTimes(1);
    expect(handler.fsmCancels).not.toHaveBeenCalled();
});

test("touch data is correctly stored", () => {
    const touch = new TouchDataImpl();
    const startHandler = mock<FSMHandler>();
    startHandler.fsmStarts = vi.fn(() => {
        touch.copy(interaction.data);
    });
    interaction.fsm.addHandler(startHandler);
    robot(canvas)
        .keepData()
        .touchstart({}, [{ identifier: 5, screenX: 14, screenY: 20, clientX: 15, clientY: 21 }])
        .touchend();
    checkTouchPoint(touch, 15, 21, 14, 20, 5, canvas);
});
```
**Key points**
- Interactions are instantiated with a (mocked) `Logger`.
- `registerToNodes([element])` attaches listeners.
- Use `robot(...).keepData()` if you need the interaction to retain the last event data.
- `checkTouchPoint` validates the internal `TouchData` object.
- Always clear timers and uninstall the interaction after each test.

---

### 6.3 Interaction Library (`test/interaction/library/*.test.ts`)
These tests follow the exact same pattern as plain interactions but instantiate a concrete interaction class (e.g., `Tap`, `ClickCurrentTarget`, `DragLock`). The only difference is the **expected FSM events** which are usually a single start‑stop pair. Example for `Tap` is shown above; replace the class name and possibly the number of expected `fsmCancels`.

---

### 6.4 Binder (`test/binder/*.test.ts`)
Binders combine an **Interaction** with a **Command** (or a **CommandBuilder**) and expose an easy‑to‑use API for client code.
```typescript
import {ButtonBinderBuilder, StubCmd, InteractionStub} from "../../src/interacto";
import {mock} from "vitest-mock-extended";
import {beforeEach, describe, expect, test, vi} from "vitest";

let binder: ButtonBinderBuilder;
let canvas: HTMLElement;
let logger = mock<Logger>();

beforeEach(() => {
    canvas = document.createElement("button");
    binder = new ButtonBinderBuilder(logger);
    binder.on(canvas).toProduce(() => new StubCmd()).bind();
});

test("binder registers correct listeners", () => {
    const interaction = (binder as any).interaction as InteractionStub; // internal, but allowed in tests
    const handler = mock<FSMHandler>();
    interaction.fsm.addHandler(handler);
    const event = new MouseEvent("click", { bubbles: true, view: window });
    canvas.dispatchEvent(event);
    expect(handler.fsmStarts).toHaveBeenCalled();
    expect(handler.fsmStops).toHaveBeenCalled();
});
```
**Pattern notes**
- Most binder tests instantiate the concrete builder (e.g., `ButtonBinderBuilder`).
- The builder’s `on(node)` method returns a fluent API; you finish with `.bind()`.
- The generated **Interaction** can be accessed via a private field (allowed in test code) to attach a mocked FSM handler.
- Verify that the associated command (`StubCmd` or a subclass) receives `execute()`, `undo()`, etc., as appropriate.

---

## 12. Coverage Reports

The command **`npm run coverage`** runs Vitest with the V8 coverage provider and writes the HTML report to the **`coverage/`** directory at the project root. After the command finishes you can open:

```
coverage/index.html
```

in a browser to explore:
- **Overall percentages** for statements, branches, functions, and lines (these must stay above the thresholds defined in `vitest.config.ts`).
- **File‑level breakdowns** showing which lines are uncovered (highlighted in red).  Click on any file in the left navigation pane to see the annotated source.
- **Per‑test coverage** (when `reportOnFailure: true` is set) – failing tests will display the exact statements that were not exercised.

### Quick Tips to Interpret the Report
1. **Navigate to the failing file** – the red‑highlighted lines indicate code paths not hit by any test case.
2. **Check branch coverage** – look for the small “B” badge; a value lower than 80 % signals missing condition‑outcome combinations.
3. **Use the filter box** at the top of the report to focus on a specific folder (e.g., `src/api/command`).
4. **Refresh after changes** – run `npm run coverage` again whenever you add or modify tests; the HTML report is regenerated.

### Adding Tests to Improve Coverage
- Identify a red line in the report → locate the associated source file → write a minimal test that triggers the uncovered branch or statement.
- For async code, make sure you **await** the command or use `flushPromises()` so the promise‑based paths are recorded.
- When dealing with **error handling**, explicitly assert that the error is thrown (`expect(() => …).toThrow(...)`) – this records the catch block.

Keeping the coverage report handy while writing new tests helps you stay above the required thresholds and quickly spot gaps.

