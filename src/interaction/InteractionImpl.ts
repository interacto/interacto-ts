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

import { FSM } from "../fsm/FSM";
import { OutputState } from "../fsm/OutputState";
import { InitState } from "../fsm/InitState";
import { Logger } from "typescript-logging";
import { catInteraction } from "../logging/ConfigLog";
import { InteractionData } from "./InteractionData";
import { EventRegistrationToken } from "../fsm/Events";
import { WidgetData } from "./WidgetData";
import { Subscription } from "rxjs";

/**
 * The base implementation of a user interaction.
 * @param <D> The type of the interaction data.
 * @param <E> The type of the events that the interaction will process.
 * @param <F> The type of the FSM.
 */
export abstract class InteractionImpl<D extends InteractionData, F extends FSM, T> implements WidgetData<T> {
    protected logger?: Logger;
    protected readonly fsm: F;
    protected asLog: boolean;
    protected readonly _registeredNodes: Set<EventTarget>;
    protected readonly _registeredTargetNode: Set<EventTarget>;
    protected readonly _additionalNodes: Array<Node>;
    protected readonly listMutationObserver: Array<MutationObserver>;
    /** The widget used during the interaction. */
    protected _widget?: T;
    private mouseHandler?: ((e: MouseEvent) => void);
    private keyHandler?: ((e: KeyboardEvent) => void);
    private uiHandler?: ((e: UIEvent) => void);
    private actionHandler?: EventListener;
    private readonly disposable: Subscription;

    /**
     * Defines if the interaction is activated or not. If not, the interaction will not
     * change on events.
     */
    protected activated: boolean;

    protected constructor(fsm: F) {
        this.activated = false;
        this.fsm = fsm;
        this.disposable = this.fsm.currentStateObservable().subscribe(current => this.updateEventsRegistered(current[1], current[0]));
        this.activated = true;
        this.asLog = false;
        this._registeredNodes = new Set<EventTarget>();
        this._additionalNodes = new Array<Node>();
        this.listMutationObserver = new Array<MutationObserver>();
        this._registeredTargetNode = new Set<EventTarget>();
    }

    /**
     * @return The widget used during the interaction.
     */
    public getWidget(): T | undefined {
        return this._widget;
    }


    protected updateEventsRegistered(newState: OutputState, oldState: OutputState): void {
        // Do nothing when the interaction has only two nodes: init node and terminal node (this is a single-event interaction).
        if (newState === oldState || this.fsm.getStates().length === 2) {
            return;
        }

        const currEvents: Array<string> = [...this.getEventTypesOf(newState)];
        const events: Array<string> = [...this.getEventTypesOf(oldState)];
        const eventsToRemove: Array<string> = events.filter(e => !currEvents.includes(e));
        const eventsToAdd: Array<string> = currEvents.filter(e => !events.includes(e));
        this._registeredNodes.forEach(n => {
            eventsToRemove.forEach(type => this.unregisterEventToNode(type, n));
            eventsToAdd.forEach(type => this.registerEventToNode(type, n));
        });
        this._additionalNodes.forEach(n => {
            n.childNodes.forEach(child => {
                // update the content of the additionalNode
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

    private callBackMutationObserver(mutationList: Array<MutationRecord>): void {
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => this.onNewNodeRegistered(node));
            mutation.removedNodes.forEach(node => this.onNodeUnregistered(node));
        });
    }

    private getEventTypesOf(state: OutputState): Set<string> {
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
            this._registeredTargetNode.add(w);
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
        this.getEventTypesOf(this.fsm.getCurrentState()).forEach(type => this.unregisterEventToNode(type, node));
    }

    public onNewNodeRegistered(node: EventTarget): void {
        this.getEventTypesOf(this.fsm.getCurrentState()).forEach(type => this.registerEventToNode(type, node));
    }

    public onNewNodeTargetRegistered(node: EventTarget): void {
        if (this.fsm.getCurrentState() !== this.fsm.initState) {
            this.getEventTypesOf(this.fsm.getCurrentState()).forEach(type => this.registerEventToNode(type, node));
        }
    }

    public registerToObservableList(elementToObserve: Node): void {
        const newMutationObserver = new MutationObserver(mutations => this.callBackMutationObserver(mutations));
        newMutationObserver.observe(elementToObserve, { childList: true });
        this.listMutationObserver.push(newMutationObserver);
    }

    public addAdditionalNodes(additionalNodes: Array<Node>): void {
        additionalNodes.forEach((node: Node) => {
            this._additionalNodes.push(node);
            node.childNodes.forEach((child: Node) => this.onNewNodeRegistered(child)); //register the additional node children
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
            this.actionHandler = (evt): void => this.processEvent(evt);
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
    }

    protected getMouseHandler(): (e: MouseEvent) => void {
        if (this.mouseHandler === undefined) {
            this.mouseHandler = (evt): void => this.processEvent(evt);
        }
        return this.mouseHandler;
    }

    protected getKeyHandler(): (e: KeyboardEvent) => void {
        if (this.keyHandler === undefined) {
            this.keyHandler = (evt): void => this.processEvent(evt);
        }
        return this.keyHandler;
    }

    protected getUIHandler(): (e: UIEvent) => void {
        if (this.uiHandler === undefined) {
            this.uiHandler = (evt): void => this.processEvent(evt);
        }
        return this.uiHandler;
    }

    /**
	 * @return Whether the user interaction is running.
	 */
    public isRunning(): boolean {
        return this.activated && !(this.fsm.getCurrentState() instanceof InitState);
    }

    /**
	 * Reinitialises the user interaction
	 */
    public fullReinit(): void {
        this.fsm.fullReinit();
    }

    /**
	 * Processes the given UI event.
	 * @param event The event to process.
	 */
    public processEvent(event: Event): void {
        if (this.isActivated()) {
            this.fsm.process(event);
        }
    }

    /**
	 * Sets the logging of the user interaction.
	 * @param log True: the user interaction will log information.
	 */
    public log(log: boolean): void {
        this.asLog = log;
        this.fsm.log(log);
    }


    /**
	 * @return True if the user interaction is activated.
	 */
    public isActivated(): boolean {
        return this.activated;
    }

    /**
	 * Sets whether the user interaction is activated.
	 * When not activated, a user interaction does not process
	 * input events any more.
	 * @param activated True: the user interaction will be activated.
	 */
    public setActivated(activated: boolean): void {
        if (this.asLog) {
            catInteraction.info("Interaction activation: " + String(activated));
        }
        this.activated = activated;
        if (!activated) {
            this.fsm.fullReinit();
        }
    }

    /**
	 * @return The FSM of the user interaction.
	 */
    public getFsm(): F {
        return this.fsm;
    }

    /**
	 * @return The interaction data of the user interaction. Cannot be null.
	 */
    public abstract getData(): D;

    protected reinit(): void {
        this.fsm.reinit();
        this.reinitData();
    }

    /**
	 * Uninstall the user interaction. Used to free memory.
	 * Then, user interaction can be used any more.
	 */
    public uninstall(): void {
        this._widget = undefined;
        this.disposable.unsubscribe();
        this._registeredNodes.clear();
        this._additionalNodes.length = 0;
        this._registeredTargetNode.clear();
        this.setActivated(false);
    }
}
