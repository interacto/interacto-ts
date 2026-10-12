# Interacto Test‑Writing Guide

**Version**: 8.2.0  
**Generated on**: 2026‑11‑10

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

You run all the commands in the project folder you can obtain with the command `pwd`.

> **Environment prerequisite — Node.js is NOT on `$PATH` by default in this workspace.**
> `node` is provided through **nvm** under `~/.nvm/versions/node/<latest>` (e.g. `v24.19.0`), and the
> test/lint/type tools are run from the local `node_modules/.bin` (or `npx`) in the project root.
> Before running any command, expose Node on the path:
> ```bash
> export PATH=$HOME/.nvm/versions/node/<latest>/bin:$PATH
> node --version   # sanity check
> ```
> If you forget this, commands fail with `command not found: node`.

```bash
# Normal unit tests + coverage
npm test                # equivalent to "vitest --run"
npm run coverage        # runs vitest with coverage thresholds

# Lint and type‑checking (executed in pre‑build)
npm run lint
npm run compile-test    # tsc compilation of the test files

# Running vitest on specific test files or cases
vitest test/interaction/library/*
vitest test/interaction/library/KeysTyped.test.ts 
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
│   ├─ animation/
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
- When writing tests, you cannot modify the sources (folder `src/`).

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
> When a symbol is **type-only** (an interface/type such as `Logger`, `When`, `LinearHistoryBase`), import
> it with `import type { … } from "../../src/interacto";` and keep value imports (`AnonBinding`, `FSMImpl`, …)
> in a separate statement — this satisfies `@typescript-eslint/consistent-type-imports`.

---

## 5. Test Structure & Style
| Aspect | Recommended practice |
|--------|----------------------|
| **Top‑level `describe`** | One `describe` per file, named *using a …* (e.g., `describe("using a Tap interaction", …)`). |
| **Test function** | Use `test` **only** (the ESLint rule `vitest/consistent-test-it` enforces `fn: "test"`). |
| **Setup / teardown** | Prefer `beforeEach` / `afterEach`. Use `vi.useFakeTimers()` when you need deterministic timing, and always restore timers (`vi.clearAllTimers()`). |
| **Test structure** | Write each test as **arrange → act → assert**: set up the initial state (possibly with a helper, without asserting mid-way), perform **exactly one** state‑changing act, then put **all assertions at the end**. Never interleave *act → assert → act → assert*; if a test needs a second act, split it into its own `test(...)` case. |
| **Mocks** | `mock<T>()` from `vitest-mock-extended` for interfaces. Use `vi.spyOn` for specific methods. |
| **Assertions** | - Equality: `expect(...).toStrictEqual(...)` or `toBe(...)` for primitives. Prefer `toStrictEqual(...)` over `toEqual(...)` — `toEqual` performs a **loose** structural comparison (it ignores `undefined` properties, inherited properties, sparse arrays, and treats `undefined` array items as missing), whereas `toStrictEqual` compares strictly and catches such differences. `toEqual` is therefore discouraged in this repo. <br>- Booleans: `toBeTruthy()` / `toBeFalsy()`. <br>- Errors: `expect(() => fn()).toThrow(ErrorMessage)`. <br>- Mock calls: `toHaveBeenCalledTimes(n)`, `not.toHaveBeenCalled()`. |
| **Async helpers** | `flushPromises()` (defined in `test/Utils.ts`) to let pending promises settle, `await` on async commands. |
| **Event factories** | Use helpers from `test/interaction/StubEvents.ts` (`createMouseEvent`, `createTouchEvent`, `createKeyEvent`, `createWheelEvent`). |
| **Robot** | `robot(target).touchstart(...).touchend()` etc. – chainable, automatically registers events on the target element. |
| **Custom checkers** | `checkTouchPoint(touch, lx, ly, sx, sy, id, element)` – validates a `TouchData` object against expected values. |
| **Indentation** | 4 spaces (enforced by the `@stylistic/indent` rule). |
| **Quotes** | Double quotes (`"`). |
| **Line length** | ≤ 150 characters (`max‑len` rule). |
| **No magic numbers** | The rule is turned off, but keep numbers meaningful and comment when needed. |
| **Arrow return types** | Arrow callbacks passed as arguments (e.g. `When` predicates, command suppliers) must declare an explicit return type: `(): boolean => …`, `(): StubCmd => …` — otherwise `@typescript-eslint/explicit-function-return-type` fails. |
| **Multiline array literals** | With `@stylistic/array-bracket-newline`, a **multiline** array literal must place each element on its own line (`[\n    {…}\n]`); single-line arrays are fine. |
| **Typed mocks with args** | Avoid `vi.fn((...args) => …)`: the rest-arg param triggers `no-unused-vars`. Prefer `vi.fn((): boolean => true)` and assert the arguments with `toHaveBeenCalledWith(...)`. |

> **Lint notes**
> - `vitest/prefer-describe-function-title` and `vitest/prefer-lowercase-title` report **warnings only** (they never fail CI), and several existing tests already carry them — do not spend effort "fixing" them.
> - `jsdoc/require-param-type` requires helper functions that carry JSDoc to give every `@param` its **type plus a dash separator**: `@param {number} x - the X value.` Omitting a type (e.g. a bare `@param x ...`) produces a warning; keep the doc comment in this `@param {type} name - description` form.
> - A failing `eslint` run must be clean of **errors** (warnings are acceptable) for CI; always re‑run `npm run lint` on the file before finishing.

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

### 6.5 Binding (`test/binding/*.test.ts`)
Bindings dispatch a command once an interaction reaches a given point (`first`, `then`, `end`, `cancel`, …) and apply `when` conditions. Driving a full interaction pipeline by hand is heavy, so the canonical pattern here is a **local subclass that exposes the `protected`/`private` methods** under thin public wrappers, plus a **factory that fills the long constructor with defaults**.

```typescript
import {AnonBinding, CancelFSMError, FSMImpl, LinearHistoryImpl} from "../../src/interacto";
import {InteractionStub} from "../interaction/InteractionStub";
import {StubCmd} from "../command/StubCmd";
import {mock} from "vitest-mock-extended";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import type {Logger} from "../../src/interacto";

// Expose the protected/private behaviour so it can be unit-tested directly (no full FSM run).
class AnonBindingStub extends AnonBinding<StubCmd, InteractionStub, unknown> {
    public setCommand(cmd: StubCmd | undefined): void { this._cmd = cmd; }
    public firstInvoke(): boolean | void  { return super.first(); }
    public endInvoke(): boolean | void    { return super.end(); }
    public whenStartInvoke(): boolean     { return super.whenStart(); }
    // … add one thin wrapper per protected/private method under test …
}

let binding: AnonBindingStub;
let interaction: InteractionStub;
let logger: Logger;

// Factory hiding the long constructor signature; each test only overrides what it needs.
function createBinding(options: {firstFn?: (c: StubCmd, i: object, a: unknown) => void;} = {}): AnonBindingStub {
    return new AnonBindingStub(
        false, interaction, logger, () => new StubCmd(), [], [],
        [], [], 0, false, false, new Map(),
        options.firstFn, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined, undefined, undefined, undefined);
}

beforeEach(() => {
    logger = mock<Logger>();
    interaction = new InteractionStub(new FSMImpl(logger));
});
```

**Pattern notes**
- The stub subclass exposes `protected`/`private` members via `super.method()` wrappers and lets you set `_cmd` and write `binding.accumulator` directly, so each callback (`first`, `then`, `end`, `cancel`, `endOrCancel`, `ifCmdHadNoEffect`, `ifCmdHadEffects`, `ifCannotExecuteCmd`) can be tested in isolation.
- The `createBinding()` factory hides the long constructor; pass only the options the current test needs.
- **Error catching**: each callback catches its own exceptions and logs `"Crash in '<method>'"` (e.g. `"Crash in 'first'"`) via `logger.logBindingErr`. Assert with `expect(logger.logBindingErr).toHaveBeenCalledWith("Crash in 'first'", err)`.
- **`when` conditions**: strict predicates throw `CancelFSMError` on `false`; non‑strict ones return `false`. `whenStart` evaluates only start-type predicates, `whenUpdate` only `then`-type ones and `whenStop` only `end`-type ones. When `this.logBinding` is on, a rejection logs `"Checking condition: false"` and a strict rejection logs `"Cancelling interaction: <InteractionClass>"`. Read these exact strings from the source rather than guessing them.

> `BindingImpl.test.ts` applies the same base-class pattern directly to `BindingImpl` for 100 % branch coverage. It also shows two extras useful when testing `BindingImpl`/`AnonBinding` paths:
> - Mocked async commands (`mock<StubCmd>()` with `cmd.execute.mockResolvedValue(...)` / `mockRejectedValue(...)`) drive the promise branches of the execution flow (harnessed with an `await tick()` helper that flushes microtasks).
> - The 5 FSM callbacks registered in the constructor (`fsmStarts`, `fsmUpdates`, `fsmStops`, `fsmCancels`, `fsmError`) are exercised by capturing the handler passed to `fsm.addHandler` and invoking it directly, avoiding a full FSM run.

---

### 6.6 Standalone Helper / Animation Classes (`test/animation/*.test.ts`)

Some helpers (e.g. `DwellSpringAnimation`) belong to no FSM or binder and expose only a tiny public API
(`process()`, `end()`) while holding **private state** (`displaySpring`, `positionSpring`) and writing to
real DOM attributes. Test such a class directly instead of through a binder.

```typescript
import {DwellSpringAnimation} from "../../src/interacto";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import type {EltRef, PointData, SrcTgtPointsData} from "../../src/interacto";

let handle: EltRef<SVGCircleElement>;
let spring: EltRef<SVGLineElement>;
let anim: DwellSpringAnimation;

beforeEach(() => {
    // Real SVG elements wrapped in an EltRef – do NOT mock<...>() the element.
    handle = {nativeElement: document.createElementNS("http://www.w3.org/2000/svg", "circle")};
    spring = {nativeElement: document.createElementNS("http://www.w3.org/2000/svg", "line")};
    vi.useFakeTimers();
});

afterEach(() => {
    vi.clearAllTimers();
});

test("arms the dwell timer and shows the spring", () => {
    anim = new DwellSpringAnimation(handle, spring);
    anim.process(data);                                     // spring hidden -> arms setInterval
    vi.advanceTimersByTime(1000);                           // fire the dwell timer deterministically
    expect(handle.nativeElement.getAttribute("display")).toBe("block");
    expect(handle.nativeElement.getAttribute("cx")).toBe("20");
});
```

**Key points**
- Build the wrapped elements with `document.createElementNS("http://www.w3.org/2000/svg", "<tag>")` and
  wrap them in an `EltRef` literal (`{nativeElement}`); the helper reads and writes real DOM attributes.
- **Private state cannot be asserted directly** — drive it through the public methods and infer the
  transition from observable `getAttribute(...)` / `setAttribute(...)` effects. Call `process()` several
  times to cycle the internal state machine (e.g. show → far pointer → hidden → re‑arm) so every branch
  of the `if (this.displaySpring)` / distance / radius-ternary conditions is covered.
- Use **`vi.advanceTimersByTime(t)`** (not `vi.runOnlyPendingTimers()`) when you must fire one specific
  internal `setInterval`/`setTimeout` callback to observe its side effects.
- When a method takes a large interface (e.g. `SrcTgtPointsData<PointData>`) but only reads a few fields,
  build a minimal literal and cast it (`as unknown as T`) instead of constructing a full fixture.
- Keep the **arrange → act → assert** shape (see §5): the `process()`/`showSpring(...)` calls used to reach a
  given internal state belong in the *arrange* phase and are not asserted there; the single act under test
  (a `process(...)` on a displayed spring, or `end()`) runs once, then the effects are asserted at the end.
  When two behaviours follow from one entry point (e.g. `end()` hides *and* a later call re‑shows), split
  them into separate tests.
- Every DOM attribute written by the covered lines must be asserted (see "Covered Lines Must Be Asserted").

---

## 7. Coverage Reports

The command **`npm run coverage`** runs Vitest with the V8 coverage provider and writes the HTML report to the **`coverage/`** directory at the project root. After the command finishes you can open:

```
coverage/coverage-final.json
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

### Per‑File / Scoped Coverage During Development

Running the whole suite (`npm run coverage`) on every iteration is slow. While developing a single test file, target just that file and restrict coverage to the source file it exercises:

```bash
vitest run test/binding/AnonBinding.test.ts \
  --coverage \
  --coverage.include='src/impl/binding/AnonBinding.ts' \
  --coverage.reporter=text
```

This prints immediate per‑file percentages (statements / branches / functions / lines) for exactly the code you are covering — the fastest way to iterate to 100 %.

### Reaching 100 % Branch Coverage

Branch coverage is the strictest gate and the easiest to miss. Two v8‑specific traps:
- **`?.` (optional chaining) and `??` (nullish coalescing) are counted as branches.** You must exercise both sides — e.g. for `this.whenFn?.filter(...).every(...) ?? false` you need one case where `whenFn` is `undefined` (falls through to the `??` fallback) and one where it is defined.
- **`&&` / `||` / ternary / `if` need every outcome.** For `if (fn !== undefined && cmd !== undefined)` cover both the “all true” path and a false path (callback undefined, or command undefined). When an inner branch only exists inside a rare path — e.g. the `if (this.logBinding)` logger call inside the strict‑`when` `CancelFSMError` throw — you must reach that path *twice* (once with logging on, once off) to cover the inner `if` on both sides.

### Adding Tests to Improve Coverage
- Identify a red line in the report → locate the associated source file → write a minimal test that triggers the uncovered branch or statement.
- For async code, make sure you **await** the command or use `flushPromises()` so the promise‑based paths are recorded.
- When dealing with **error handling**, explicitly assert that the error is thrown (`expect(() => …).toThrow(...)`) – this records the catch block.

### Covered Lines Must Be Asserted

The coverage tooling records a line as **covered** as soon as it has been *executed* — but executing a line is **not** the same as verifying it. Running a line without checking its effect only inflates the percentage while leaving real defects undetected.

Therefore, whenever a test makes a source line **run**, it **must also assert** on the observable effect of that line: its returned value, a state change, a mock call, or a thrown error. A test that merely drives code but never checks the outcome is not acceptable.

Concretely:
- If the line **produces a value**, assert on that value: `expect(result).toStrictEqual(...)`.
- If the line **mutates state**, read the state back and assert on it: `expect(history.getLastUndo()).toBe(undoable)`.
- If the line **calls another object**, assert the call: `expect(mock.method).toHaveBeenCalledTimes(1)`.
- If the line **can throw**, assert the thrown error: `expect(() => fn()).toThrow(...)`.
- If the line is **async**, `await` it (or `flushPromises()`) *before* asserting, so the assertion observes the settled result.
- If a method is tested, perform extreme mutations on it: remove its content (if void); replace its content by return false or return true (if boolean), etc.
> **Arrange vs. assert.** The *arrange* phase of a test (e.g. calling `process()`/`showSpring(...)` to reach a
> given internal state before the act-under-test) may execute source lines whose effect is **not asserted in
> that same test** (see §5 and §6.6). That is acceptable as long as those same lines and their effects are
> asserted somewhere — typically in the test dedicated to that behaviour — so coverage is never *only* executed.
> Keep the arrange phase assertion‑free; put the assertions that verify the act-under-test at the end.
> **Rule of thumb**: if you can delete the assertion from a test and the test still "covers" the same lines, that test is only executing code rather than testing it. Add assertions that verify what those executed lines actually do.

Keeping the coverage report handy while writing new tests helps you stay above the required thresholds and quickly spot gaps.

