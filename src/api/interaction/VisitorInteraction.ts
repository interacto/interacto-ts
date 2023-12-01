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

import type {Interaction} from "./Interaction";
import type {InteractionData} from "./InteractionData";
import type {VisitorFSM} from "../fsm/VisitorFSM";

/**
 * The main interface for visiting user interactions.
 */
export interface VisitorInteraction extends VisitorFSM {
    visitInteraction(interaction: Interaction<InteractionData>): void;
}
