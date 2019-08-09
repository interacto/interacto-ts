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

import {FSM} from "../src-core/fsm/FSM";
import {InteractionImpl} from "../src-core/interaction/InteractionImpl";
import {OutputState} from "../src-core/fsm/OutputState";
import {EventRegistrationToken} from "./Events";
import {InteractionData} from "../src-core/interaction/InteractionData";
import {WidgetData} from "../src-core/interaction/WidgetData";
import {MArray} from "../util/ArrayUtil";

export abstract class TSInteraction<D extends InteractionData, F extends FSM<Event>, T> extends InteractionImpl<D, Event, F>
        implements WidgetData<T> {
    protected readonly _registeredNodes: Set<EventTarget>;
    protected readonly _registeredTargetNode: MArray<EventTarget>;
    protected readonly _additionalNodes: MArray<Node>;
    protected readonly listMutationObserver: MArray<MutationObserver>;
    /** The widget used during the interaction. */
    protected _widget: T | undefined;
    private mouseHandler: ((e: MouseEvent) => void) | undefined;
    private keyHandler: ((e: KeyboardEvent) => void) | undefined;
    private uiHandler: ((e: UIEvent) => void) | undefined;
    private actionHandler: EventListener | undefined;

    protected constructor(fsm: F) {
        super(fsm);
        this._registeredNodes = new Set<EventTarget>();
        this._additionalNodes = new MArray<Node>();
        this.listMutationObserver = new MArray<MutationObserver>();
        this._registeredTargetNode = new MArray<EventTarget>();
    }

    /**
     * @return The widget used during the interaction.
     */
    public getWidget(): T | undefined {
        return this._widget;
    }

    protected updateEventsRegistered(newState: OutputState<Event>, oldState: OutputState<Event>): void {
        // Do nothing when the interaction has only two nodes: init node and terminal node (this is a single-event interaction).
        if (newState === oldState || this.fsm.getStates().length === 2) {
            return;
        }

        const currEvents: Array<string> = [...this.getEventTypesOf(newState)];
        const events: Array<string> = [...this.getEventTypesOf(oldState)];
        const eventsToRemove: Array<string> = events.filter(e => currEvents.indexOf(e) < 0);
        const eventsToAdd: Array<string> = currEvents.filter(e => events.indexOf(e) < 0);
        this._registeredNodes.forEach(n => {
            eventsToRemove.forEach(type => this.unregisterEventToNode(type, n));
            eventsToAdd.forEach(type => this.registerEventToNode(type, n));
        });
        this._additionalNodes.forEach( n => {
            n.childNodes.forEach(child => {// update the content of the additionalNode
                eventsToRemove.forEach(type => this.unregisterEventToNode(type, child));
                eventsToAdd.forEach(type => this.registerEventToNode(type, child));
            });
        });
        this._registeredTargetNode.forEach(n => {
            eventsToRemove.forEach(type => this.unregisterEventToNode(type, n));
        });
        if (newState !== this.fsm.initState) {
            this._registeredTargetNode.forEach(n => {
                eventsToAdd.forEach(type => this.registerEventToNode(type, n));
            });
        }
    }

    private callBackMutationObserver(mutationList: Array<MutationRecord>) {
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => this.onNewNodeRegistered(node));
            mutation.removedNodes.forEach(node => this.onNodeUnregistered(node));
        });
    }

    private getEventTypesOf(state: OutputState<Event>): Set<string> {
        return state.getTransitions().map(t => t.getAcceptedEvents()).reduce((a, b) => new Set([...a, ...b]));
    }

    public registerToNodes(widgets: Array<EventTarget>): void {
        widgets.forEach(w => {
            this._registeredNodes.add(w);
            this.onNewNodeRegistered(w);
        });
    }

    public registerToTargetNodes(targetWidgets: Array<EventTarget>): void {
        targetWidgets.forEach(w => {
            this._registeredTargetNode.push(w);
            this.onNewNodeTargetRegistered(w);
        });
    }

    public unregisterFromNodes(widgets: Array<EventTarget>): void {
        widgets.forEach(w => {
            this._registeredNodes.delete(w);
            this.onNodeUnregistered(w);
        });
    }

    public onNodeUnregistered(node: EventTarget): void {
        this.getEventTypesOf(this.fsm.currentState).forEach(type => this.unregisterEventToNode(type, node));
    }

    public onNewNodeRegistered(node: EventTarget): void {
        this.getEventTypesOf(this.fsm.currentState).forEach(type => this.registerEventToNode(type, node));
    }

    public onNewNodeTargetRegistered(node: EventTarget): void {
        if (this.fsm.currentState !== this.fsm.initState) {
            this.getEventTypesOf(this.fsm.currentState).forEach(type => this.registerEventToNode(type, node));
        }
    }

    public registerToObservableList(elementToObserve: Node) {
        const newMutationObserver = new MutationObserver(mutations => this.callBackMutationObserver(mutations));
        newMutationObserver.observe(elementToObserve, {childList: true});
        this.listMutationObserver.push(newMutationObserver);
    }

    public addAdditionalNodes(additionalNodes: Array<Node>) {
        additionalNodes.forEach(node => {
            this._additionalNodes.push(node);
            node.childNodes.forEach(child => this.onNewNodeRegistered(child)); //register the additional node children
        });
    }

    private registerEventToNode(eventType: string, node: EventTarget): void {
        if (EventRegistrationToken.MouseDown === eventType) {
            node.addEventListener(EventRegistrationToken.MouseDown, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.MouseUp === eventType) {
            node.addEventListener(EventRegistrationToken.MouseUp, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.Click === eventType) {
            node.addEventListener(EventRegistrationToken.Click, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.MouseMove === eventType) {
            node.addEventListener(EventRegistrationToken.MouseMove, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.KeyDown === eventType) {
            node.addEventListener(EventRegistrationToken.KeyDown, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.KeyUp === eventType) {
            node.addEventListener(EventRegistrationToken.KeyUp, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.Scroll === eventType) {
            node.addEventListener(EventRegistrationToken.Scroll, this.getUIHandler());
            return;
        }
        if (EventRegistrationToken.BeforeUnload === eventType) {
            node.addEventListener(EventRegistrationToken.BeforeUnload, this.getActionHandler());
        }
    }

    protected registerActionHandlerClick(node: EventTarget): void {
        node.addEventListener(EventRegistrationToken.Click, this.getActionHandler());
    }

    protected unregisterActionHandlerClick(node: EventTarget): void {
        node.removeEventListener(EventRegistrationToken.Click, this.getActionHandler());
    }

    protected registerActionHandlerInput(node: EventTarget): void {
        node.addEventListener(EventRegistrationToken.Input, this.getActionHandler());
    }

    protected unregisterActionHandlerInput(node: EventTarget): void {
        node.removeEventListener(EventRegistrationToken.Input, this.getActionHandler());
    }

    protected getActionHandler(): EventListener {
        if (this.actionHandler === undefined) {
            this.actionHandler = evt => this.processEvent(evt);
        }
        return this.actionHandler;
    }

    public reinitData(): void {
        this._widget = undefined;
    }

    private unregisterEventToNode(eventType: string, node: EventTarget): void {
        if (EventRegistrationToken.MouseDown === eventType) {
            node.removeEventListener(EventRegistrationToken.MouseDown, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.MouseUp === eventType) {
            node.removeEventListener(EventRegistrationToken.MouseUp, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.Click === eventType) {
            node.removeEventListener(EventRegistrationToken.Click, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.MouseMove === eventType) {
            node.removeEventListener(EventRegistrationToken.MouseMove, this.getMouseHandler());
            return;
        }
        if (EventRegistrationToken.KeyDown === eventType) {
            node.removeEventListener(EventRegistrationToken.KeyDown, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.KeyUp === eventType) {
            node.removeEventListener(EventRegistrationToken.KeyUp, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.Scroll === eventType) {
            node.removeEventListener(EventRegistrationToken.Scroll, this.getUIHandler());
            return;
        }
        if (EventRegistrationToken.BeforeUnload === eventType) {
            node.removeEventListener(EventRegistrationToken.BeforeUnload, this.getActionHandler());
        }
    }

    protected getMouseHandler(): (e: MouseEvent) => void {
        if (this.mouseHandler === undefined) {
            this.mouseHandler = evt => this.processEvent(evt);
        }
        return this.mouseHandler;
    }

    protected getKeyHandler(): (e: KeyboardEvent) => void {
        if (this.keyHandler === undefined) {
            this.keyHandler = evt => this.processEvent(evt);
        }
        return this.keyHandler;
    }

    protected getUIHandler(): (e: UIEvent) => void {
        if (this.uiHandler === undefined) {
            this.uiHandler = evt => this.processEvent(evt);
        }
        return this.uiHandler;
    }

    public uninstall(): void {
        this._widget = undefined;
        this._registeredNodes.clear();
        this._additionalNodes.clear();
        this._registeredTargetNode.clear();
        super.uninstall();
    }
}
