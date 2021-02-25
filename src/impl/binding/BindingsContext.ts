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

import type {BindingsObserver} from "../../api/binding/BindingsObserver";
import type {Binding} from "../../api/binding/Binding";
import type {Command} from "../../api/command/Command";
import type {Interaction} from "../../api/interaction/Interaction";
import type {InteractionData} from "../../api/interaction/InteractionData";
import type {Subscription} from "rxjs/internal/Subscription";

/**
 * An object for observing creates bindings.
 * Can be used with `Bindings.setBindingObserver` to set the global bindings observer
 */
export class BindingsContext implements BindingsObserver {
    /**
     * The bindings gathered when created using `Bindings` routines
     */
    private readonly binds: Array<Binding<Command, Interaction<InteractionData>, InteractionData>>;

    /**
     * For each gathered binding, listening the produced commands
     */
    private readonly disposables: Array<Subscription>;

    /**
     * The commands produced by the gathered bindings
     */
    private readonly cmds: Array<[Command, Binding<Command, Interaction<InteractionData>, InteractionData>]>;

    public constructor() {
        this.binds = [];
        this.disposables = [];
        this.cmds = [];
    }

    public observeBinding(binding: Binding<Command, Interaction<InteractionData>, InteractionData>): void {
        this.binds.push(binding);
        this.disposables.push(binding.produces().subscribe(cmd => this.cmds.push([cmd, binding])));
    }

    public clearObservedBindings(): void {
        this.disposables.forEach(d => {
            d.unsubscribe();
        });
        this.binds.forEach(b => {
            b.uninstallBinding();
        });
    }

    /**
     * Returns a read-only array of the gathered bindings.
     */
    public get bindings(): ReadonlyArray<Binding<Command, Interaction<InteractionData>, InteractionData>> {
        return this.binds;
    }

    /**
     * Returns a read-only array of the commands produced by the gathered bindings.
     */
    public get commands(): ReadonlyArray<Command> {
        return this.cmds.map(tuple => tuple[0]);
    }

    /**
     * Returns the command at the given index. The command is casted into the provided generic type.
     * @param index - The index of the command (in the order of production)
     * @typeParam C - The type of the command to return.
     */
    public getCmd<C extends Command>(index: number): C {
        return this.cmds[index][0] as C;
    }

    /**
     * Returns the commands produced by the given binding.
     * @param binding - binding The binding to consider
     */
    public getCmdsProducedBy(binding: Binding<Command, Interaction<InteractionData>, InteractionData>): ReadonlyArray<Command> {
        return this.cmds
            .filter(c => c[1] === binding)
            .map(c => c[0]);
    }
}
