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

import {TSInteraction} from "../interaction/TSInteraction";
import {WidgetBindingImpl} from "../src-core/binding/WidgetBindingImpl";
import {FSM} from "../src-core/fsm/FSM";
import {CommandImpl} from "../src-core/command/CommandImpl";
import {Command} from "../src-core/command/Command";
import {InteractionData} from "../src-core/interaction/InteractionData";

export abstract class TSWidgetBinding<C extends CommandImpl, I extends TSInteraction<D, FSM<Event>, {}>, D extends InteractionData>
        extends WidgetBindingImpl<C, I, D> {
    /**
     * Creates a widget binding. This constructor must initialise the interaction. The binding is (de-)activated if the given
     * instrument is (de-)activated.
     * @param exec Specifies whether the command must be execute or update on each evolution of the interaction.
     * @param cmdProducer The type of the command that will be created. Used to instantiate the command by reflexivity.
     * The class must be public and must have a constructor with no parameter.
     * @param interaction The user interaction of the binding.
     * @param widgets The widgets concerned by the binding. Cannot be null.
     * @throws IllegalArgumentException If the given interaction or instrument is null.
     */
    protected constructor(exec: boolean, interaction: I, cmdProducer: (d?: D) => C, widgets: Array<EventTarget>) {
        super(exec, interaction, cmdProducer);
        interaction.registerToNodes(widgets);
    }

    public when(): boolean {
        return true;
    }

    protected executeCmdAsync(cmd: Command): void {
        //TODO
    }
}
