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
import type {Flushable} from "./Flushable";
import type {ThenData} from "../../api/interaction/ThenData";

/**
 * The implementation of ThenData
 * @typeParam DX - The types of the sub interaction data.
 */
export class ThenDataImpl<DX extends Array<Flushable>> implements ThenData<DX>, Flushable {
    public readonly dx: DX;

    public constructor(dx: DX) {
        this.dx = dx;
    }

    public flush(): void {
        for (const data of this.dx) {
            data.flush();
        }
    }
}
