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
import { BaseBinderBuilder } from "./BaseBinderBuilder";
import { LogLevel } from "../../logging/LogLevel";

export interface BaseUpdateBinderBuilder<W> extends BaseBinderBuilder<W>  {
	/**
	 * Specifies whether the command must be executed on each evolution of the interaction (if 'when' predicate is ok).
	 * @return The builder to chain the building configuration.
	 */
	 continuousExecution(): BaseUpdateBinderBuilder<W>;

	/**
	 * The interaction does not start if the condition of the binding ('when') is not fulfilled.
	 * @return The builder to chain the building configuration.
	 */
	strictStart(): BaseUpdateBinderBuilder<W>;

	/**
	 * Backpressure operation. Instead of emitting all the events, successive events of the same type are factorized modulo a timeout.
	 * The timeout is used to send at max one event of the same type in a given duration (the timeout).
	 * For example with three mouse moves and a time out of 10ms.
	 * The first move is received and processed. The timer starts. A second mouse moves is received at T+5ms.
	 * It is for the moment not processed. A third mouse move is received at T+8ms. The second move is finally ignored
     * and this third one not processed yet.
	 * At T+10s the third event is finally processed.
	 * Based on our own experiments, the given timeout value should be greater than 10ms to throttle some UI events.
	 * @param timeout The timeout used by the throttle operation. In ms.
	 * @return The builder to chain the building configuration.
	 */
	throttle(timeout: number): BaseUpdateBinderBuilder<W>;

    when(whenPredicate: () => boolean): BaseUpdateBinderBuilder<W>;

    end(endFct: () => void): BaseUpdateBinderBuilder<W>;

    log(...level: Array<LogLevel>): BaseUpdateBinderBuilder<W>;

    // async(): BaseUpdateBinderBuilder<W>;

    // help(): BaseUpdateBinderBuilder<W>;

    on(...widgets: Array<W>): BaseUpdateBinderBuilder<W>;
}
