/* eslint-disable id-length */
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

import type {Binding} from "../../api/binding/Binding";
import type {Command} from "../../api/command/Command";
import type {Interaction} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {Subscription} from "rxjs";

/**
 * Fitt's Law data. Immutable.
 */
export class FittsLawDataImpl {
    public readonly t: number;

    public readonly w: number;

    public readonly h: number;

    public readonly d: number;

    /**
     * Creates the data.
     * @param t - The time in ms. Be careful about fingerprinting protection:
     * https://developer.mozilla.org/en-US/docs/Web/API/Performance/now#reduced_time_precision
     * @param w - The width of the target object
     * @param h - The height of the target object
     * @param d - the distance from the first mouse event to the center of the target object
     */
    public constructor(t: number, w: number, h: number, d: number) {
        this.d = d;
        this.h = h;
        this.w = w;
        this.t = t;
    }

    /**
     * The ID part of the Fitt's law.
     * @param we - Effective target width (std dev on distances), to be used instead of the classical distance.
     * @returns The ID
     */
    public getID(we?: number): number {
        return Math.log2((this.d / (we ?? this.w)) + 1);
    }
}

/**
 * Permits to compute Fitt's law data based on the usage of two Interacto bindings.
 */
export class FittsLaw {
    private readonly obsSrc: Subscription;

    private readonly providedTarget: Element | undefined;

    private readonly data: Array<FittsLawDataImpl>;

    private _startX: number | undefined;

    private _startY: number | undefined;

    private _target: Element | undefined;

    private readonly handler: (evt: MouseEvent) => void;

    /**
     * @param bSrc - The source binding.
     * @param bTgt - The target binding.
     * @param target - The optional target object. If not provided, the target object will be inferred
     * from event data.
     */
    public constructor(bSrc: Binding<Command, Interaction<InteractionData>, unknown>,
                       bTgt: Binding<Command, Interaction<InteractionData>, unknown>,
                       target?: Element) {
        this.data = [];
        this.providedTarget = target;

        this.handler = (evt: MouseEvent): void => {
            if (this._startX === undefined) {
                this._startX = evt.screenX;
                this._startY = evt.screenY;
            }
            this._target = this.providedTarget ?? (evt.target instanceof Element ? evt.target : undefined);
        };

        this.obsSrc = bSrc.produces.subscribe(() => {
            this.reinit();
            document.body.addEventListener("mousemove", this.handler);
            const t0 = performance.now();
            const obsTgt = bTgt.produces.subscribe(() => {
                const t1 = performance.now();
                this.data.push(new FittsLawDataImpl(
                    t1 - t0,
                    this._target?.clientWidth ?? Number.NaN,
                    this._target?.clientHeight ?? Number.NaN,
                    this.computeD()));
                obsTgt.unsubscribe();
                document.body.removeEventListener("mousemove", this.handler);
            });
        });
    }

    private computeD(): number {
        if (this._startX === undefined || this.providedTarget === undefined) {
            return Number.NaN;
        }

        const a = this.providedTarget.clientLeft + this.providedTarget.clientWidth / 2 + this._startX;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const b = this.providedTarget.clientTop + this.providedTarget.clientHeight / 2 + this._startY!;

        return Math.hypot(a, b);
    }

    /**
     * Computes the effective target width (std dev on distances).
     * @returns The effective target width.
     */
    public get we(): number {
        const ds = this.data.map(d => d.d);

        const mean = ds.reduce((a, b) => a + b) / ds.length;
        return Math.sqrt(ds.map(x => (x - mean) ** 2).reduce((a, b) => a + b) / ds.length);
    }

    /**
     * Computes the a and b coefficent of the regression line.
     * @param effectiveTargetW - If true, will consider the effective target width. Otherwise will consider
     * the computed distances.
     * @returns the regression lien coefficients.
     */
    public getAB(effectiveTargetW = false): [a: number, b: number, r: number] {
        // Linear regression

        // do we consider effective target width
        const w = effectiveTargetW ? this.we : undefined;
        // 'id' are the x values
        const xs = this.data.map(d => d.getID(w));
        // 't' are the y values
        const ys = this.data.map(d => d.t);
        let sumx = 0;
        let sumy = 0;
        let sumxy = 0;
        let sumxx = 0;
        let sumyy = 0;

        for (const [i, y] of ys.entries()) {
            sumx += xs[i] ?? 0;
            sumy += y;
            sumxy += (xs[i] ?? 0) * y;
            sumxx += (xs[i] ?? 0) ** 2;
            sumyy += y * y;
        }

        const tmp = (ys.length * sumxy) - (sumx * sumy);
        const tmp2 = (ys.length * sumxx) - (sumx ** 2);
        // 'a' is the slope
        const a = tmp / tmp2;
        // 'b' is the intercept
        const b = (sumy - a * sumx) / ys.length;
        // Correlation coefficient 'r'
        const r = (tmp / Math.sqrt(tmp2 * (ys.length * sumyy - sumy ** 2))) ** 2;

        return [a, b, r];
    }

    /**
     * Cleans the object
     */
    public uninstall(): void {
        this.obsSrc.unsubscribe();
        this.data.length = 0;
    }

    private reinit(): void {
        this._startX = undefined;
        this._startY = undefined;
        this._target = undefined;
    }
}
