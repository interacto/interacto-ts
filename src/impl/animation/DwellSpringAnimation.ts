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

import type {EltRef} from "../../api/binder/BaseBinderBuilder";
import type {SrcTgtPointsData} from "../../api/interaction/SrcTgtPointsData";
import type {TouchData} from "../../api/interaction/TouchData";
import type {PointData} from "../../api/interaction/PointData";

/**
 * Controls the dwell and spring animation.
 * See the reciprocal DnD binders.
 */
export class DwellSpringAnimation {
    private displaySpring = false;

    private interval: number | undefined;

    private positionSpring: {"x": number; "y": number};

    private readonly radius: number;

    private readonly handle: EltRef<SVGCircleElement>;

    private readonly spring: EltRef<SVGLineElement>;

    public constructor(handle: Readonly<EltRef<SVGCircleElement>>, spring: Readonly<EltRef<SVGLineElement>>) {
        this.interval = undefined;
        this.radius = Number.parseInt(handle.nativeElement.getAttribute("r") ?? "20", 10);
        this.handle = handle;
        this.spring = spring;
        this.positionSpring = {
            "x": 0,
            "y": 0
        };
    }

    public process(i: SrcTgtPointsData<PointData | TouchData>): void {
        /*
         * Management of the dwell and spring
         * The element to use for this interaction (handle) must have the "ioDwellSpring" class
         */
        if (this.displaySpring) {
            const distance = Math.hypot((i.tgt.clientX - this.positionSpring.x), (i.tgt.clientY - this.positionSpring.y));
            if (Math.abs(distance) > (this.radius * 4)) {
                this.spring.nativeElement.setAttribute("display", "none");
                this.handle.nativeElement.setAttribute("display", "none");
                this.displaySpring = false;
            }
        } else {
            clearInterval(this.interval);
            this.interval = window.setInterval(() => {
                clearInterval(this.interval);
                this.displaySpring = true;
                this.positionSpring = {
                    "x": i.tgt.clientX < this.radius ? this.radius : i.tgt.clientX - this.radius * 2,
                    "y": i.tgt.clientY
                };
                this.spring.nativeElement.setAttribute("display", "block");
                this.handle.nativeElement.setAttribute("display", "block");
                this.handle.nativeElement.setAttribute("cx", String(this.positionSpring.x));
                this.handle.nativeElement.setAttribute("cy", String(this.positionSpring.y));
                this.spring.nativeElement.setAttribute("x1", String(i.src.clientX));
                this.spring.nativeElement.setAttribute("y1", String(i.src.clientY));
                this.spring.nativeElement.setAttribute("x2", String(this.positionSpring.x));
                this.spring.nativeElement.setAttribute("y2", String(i.tgt.clientY));
            }, 1000);
        }
    }

    public end(): void {
        clearInterval(this.interval);
        this.displaySpring = false;
        this.spring.nativeElement.setAttribute("display", "none");
        this.handle.nativeElement.setAttribute("display", "none");
    }
}
