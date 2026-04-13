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

import {CommandBase} from "./CommandBase";
import type {Undoable, UndoableSnapshot} from "../../api/history/Undoable";

/**
 * The base class for undoable UI commands.
 * @category Command
 */
export abstract class UndoableCommand<T extends UndoableSnapshot = undefined> extends CommandBase implements Undoable {
    /**
     * Defines whether the cache of the visual snapshot must be updated.
     */
    protected mustRefreshCache: boolean;

    /**
     * The cache of the visual snapshot.
     */
    protected cacheVisualSnapshot: T | undefined;

    public constructor() {
        super();
        this.mustRefreshCache = true;
        this.cacheVisualSnapshot = undefined;
    }

    public getUndoName(): string {
        return this.constructor.name;
    }

    /**
     * Marks the visual snapshot cache as outdated.
     * It will be updated the next time `getVisualSnapshot` is called.
     */
    public refreshCache(): void {
        this.mustRefreshCache = true;
    }

    public getVisualSnapshot(): T | undefined {
        if (this.mustRefreshCache) {
            this.mustRefreshCache = false;
            this.cacheVisualSnapshot = this.createVisualSnapshot();
        }
        return this.cacheVisualSnapshot;
    }

    /**
     * Produces a snapshot, never mind the cache. Called by `getVisualSnapshot`.
     * @returns The produced visual snapshot or undefined.
     */
    protected createVisualSnapshot(): T | undefined {
        return undefined;
    }

    public equals(undoable: unknown): boolean {
        return this === undoable;
    }

    public abstract redo(): void;

    public abstract undo(): void;
}
