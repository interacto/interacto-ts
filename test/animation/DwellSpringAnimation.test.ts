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
 * You should have received a copy of the GNU General Public License
 * along with Interacto. If not, see <https://www.gnu.org/licenses/>.
 */
import {DwellSpringAnimation} from "../../src/interacto";
import {afterEach, beforeEach, describe, expect, test, vi} from "vitest";
import type {EltRef, PointData, SrcTgtPointsData} from "../../src/interacto";

describe("using a dwell spring animation", () => {
    let handle: EltRef<SVGCircleElement>;
    let spring: EltRef<SVGLineElement>;
    let anim: DwellSpringAnimation;

    /**
     * Builds a minimal SrcTgtPointsData carrying only the clientX / clientY coordinates the
     * animation reads. The missing fields are irrelevant to DwellSpringAnimation.
     * @param {number} sx - The source clientX.
     * @param {number} sy - The source clientY.
     * @param {number} tx - The target clientX.
     * @param {number} ty - The target clientY.
     * @returns A SrcTgtPointsData instance.
     */
    const data = (sx: number, sy: number, tx: number, ty: number): SrcTgtPointsData<PointData> => ({
        src: {clientX: sx, clientY: sy},
        tgt: {clientX: tx, clientY: ty}
    }) as unknown as SrcTgtPointsData<PointData>;

    /**
     * Drives the initial process() call (spring hidden) and lets the dwell timer fire so that
     * the spring gets displayed.
     * @param {number} sx - The source clientX.
     * @param {number} sy - The source clientY.
     * @param {number} tx - The target clientX.
     * @param {number} ty - The target clientY.
     */
    const showSpring = (sx: number, sy: number, tx: number, ty: number): void => {
        anim.process(data(sx, sy, tx, ty));
        vi.advanceTimersByTime(1000);
    };

    beforeEach(() => {
        handle = {nativeElement: document.createElementNS("http://www.w3.org/2000/svg", "circle")};
        spring = {nativeElement: document.createElementNS("http://www.w3.org/2000/svg", "line")};
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    test("uses the handle radius from the r attribute to compute the spring position", () => {
        handle.nativeElement.setAttribute("r", "20");
        anim = new DwellSpringAnimation(handle, spring);

        anim.process(data(100, 100, 100, 100));
        vi.advanceTimersByTime(1000);

        // clientX (100) is >= radius (20): ternary false branch => x = 100 - 2 * 20 = 60
        expect(handle.nativeElement.getAttribute("display")).toBe("block");
        expect(spring.nativeElement.getAttribute("display")).toBe("block");
        expect(handle.nativeElement.getAttribute("cx")).toBe("60");
        expect(handle.nativeElement.getAttribute("cy")).toBe("100");
        expect(spring.nativeElement.getAttribute("x1")).toBe("100");
        expect(spring.nativeElement.getAttribute("y1")).toBe("100");
        expect(spring.nativeElement.getAttribute("x2")).toBe("60");
        expect(spring.nativeElement.getAttribute("y2")).toBe("100");
    });

    test("defaults to a 20px radius when the handle has no r attribute", () => {
        anim = new DwellSpringAnimation(handle, spring);

        showSpring(100, 100, 10, 100);

        // clientX (10) is < radius (20): ternary true branch => x = radius = 20
        expect(handle.nativeElement.getAttribute("display")).toBe("block");
        expect(spring.nativeElement.getAttribute("display")).toBe("block");
        expect(handle.nativeElement.getAttribute("cx")).toBe("20");
        expect(handle.nativeElement.getAttribute("cy")).toBe("100");
        expect(spring.nativeElement.getAttribute("x2")).toBe("20");
        expect(spring.nativeElement.getAttribute("y2")).toBe("100");
    });

    test("hides the spring when the pointer moves far from the dwell position", () => {
        handle.nativeElement.setAttribute("r", "20");
        anim = new DwellSpringAnimation(handle, spring);

        // Show the spring first so the far-pointer condition is evaluated on a displayed spring.
        showSpring(0, 0, 0, 0);

        anim.process(data(0, 0, 500, 500));

        // The pointer far away (> radius * 4 = 80) hides both elements.
        expect(spring.nativeElement.getAttribute("display")).toBe("none");
        expect(handle.nativeElement.getAttribute("display")).toBe("none");
    });

    test("keeps the spring displayed when the pointer stays close", () => {
        handle.nativeElement.setAttribute("r", "20");
        anim = new DwellSpringAnimation(handle, spring);

        // Show the spring first so the close-pointer condition is evaluated on a displayed spring.
        showSpring(0, 0, 0, 0);

        anim.process(data(0, 0, 21, 0));

        // The pointer close (distance 1 <= 80) does not hide anything.
        expect(handle.nativeElement.getAttribute("display")).toBe("block");
        expect(spring.nativeElement.getAttribute("display")).toBe("block");
    });

    test("end hides the spring and the handle", () => {
        handle.nativeElement.setAttribute("r", "20");
        anim = new DwellSpringAnimation(handle, spring);
        showSpring(0, 0, 0, 0);

        anim.end();

        expect(spring.nativeElement.getAttribute("display")).toBe("none");
        expect(handle.nativeElement.getAttribute("display")).toBe("none");
    });

    test("shows the spring again after being ended", () => {
        handle.nativeElement.setAttribute("r", "20");
        anim = new DwellSpringAnimation(handle, spring);
        showSpring(0, 0, 0, 0);
        anim.end();

        showSpring(0, 0, 5, 5);

        expect(handle.nativeElement.getAttribute("display")).toBe("block");
        expect(spring.nativeElement.getAttribute("display")).toBe("block");
        expect(handle.nativeElement.getAttribute("cx")).toBe("20");
        expect(handle.nativeElement.getAttribute("cy")).toBe("5");
    });
});

