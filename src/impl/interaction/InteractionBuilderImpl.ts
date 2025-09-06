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

import {CancelFSMError} from "../fsm/CancelFSMError";
import type {Interaction, InteractionDataType} from "../../api/interaction/Interaction";
import type {InteractionBuilder} from "../../api/interaction/InteractionBuilder";

/**
 * An implementation of `InteractionBuilder`.
 * @category Interaction
 */
export class InteractionBuilderImpl<I extends Interaction<D>, D extends object = InteractionDataType<I>>
implements InteractionBuilder<I, D> {
    private readonly iCtor: (name?: string) => I;

    private startPredicate: ((i: D) => boolean) | undefined;

    private thenPredicate: ((i: D) => boolean) | undefined;

    private endPredicate: ((i: D) => boolean) | undefined;

    private interactionName: string | undefined;

    /**
     * @param interactionSupplier - The command that provides an instance of the
     * user interaction to customize.
     */
    public constructor(interactionSupplier: (name?: string) => I) {
        this.iCtor = interactionSupplier;
        this.startPredicate = undefined;
        this.thenPredicate = undefined;
        this.endPredicate = undefined;
        this.interactionName = undefined;
    }

    public first(predicate: (i: D) => boolean): this {
        this.startPredicate = predicate;
        return this;
    }

    public then(predicate: (i: D) => boolean): this {
        this.thenPredicate = predicate;
        return this;
    }

    public firstAndThen(predicate: (i: D) => boolean): this {
        this.first(predicate);
        this.then(predicate);
        return this;
    }

    public end(predicate: (i: D) => boolean): this {
        this.endPredicate = predicate;
        return this;
    }

    public name(name: string): this {
        this.interactionName = name;
        return this;
    }

    public build(): () => I {
        return () => {
            const i = this.iCtor(this.interactionName);
            i.fsm.addHandler({
                "preFsmStart": () => {
                    this.process(i, this.startPredicate);
                },
                "preFsmUpdate": () => {
                    this.process(i, this.thenPredicate);
                },
                "preFsmStop": () => {
                    this.process(i, this.endPredicate);
                }
            });
            return i;
        };
    }

    private process(i: I, predicate?: (d: D) => boolean): void {
        if (predicate !== undefined && !predicate(i.data)) {
            throw new CancelFSMError();
        }
    }
}
