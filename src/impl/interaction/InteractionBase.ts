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

import {FSM} from "../../api/fsm/FSM";
import {OutputState} from "../../api/fsm/OutputState";
import {InitState} from "../fsm/InitState";
import {catInteraction} from "../../api/logging/ConfigLog";
import {InteractionData} from "../../api/interaction/InteractionData";
import {EventRegistrationToken, isKeyEvent, isMouseEvent, isTouchEvent} from "../fsm/Events";
import {Subscription} from "rxjs";
import {Interaction} from "../../api/interaction/Interaction";

/**
 * The base implementation of a user interaction.
 * @param <D> The type of the interaction data.
 * @param <F> The type of the FSM.
 */
export abstract class InteractionBase<D extends InteractionData, F extends FSM> implements Interaction<D, F> {
    protected readonly fsm: F;

    protected asLog: boolean;

    protected readonly registeredNodes: Set<EventTarget>;

    protected readonly additionalNodes: Array<Node>;

    /** The current list of mutation observers. Used for listening changes in node lists. */
    protected readonly mutationObservers: Array<MutationObserver>;

    /** The interaction data */
    protected readonly data: D;

    private mouseHandler?: ((e: MouseEvent) => void);

    private touchHandler?: ((e: TouchEvent) => void);

    private keyHandler?: ((e: KeyboardEvent) => void);

    private uiHandler?: ((e: UIEvent) => void);

    private actionHandler?: EventListener;

    private readonly disposable: Subscription;

    private stopImmediatePropag: boolean;

    private preventDef: boolean;

    /**
     * Defines if the interaction is activated or not. If not, the interaction will not
     * change on events.
     */
    protected activated: boolean;

    /**
     * Creates the interaction.
     * @param fsm The FSM that defines the behavior of the user interaction.
     */
    public constructor(fsm: F) {
        this.activated = false;
        this.stopImmediatePropag = false;
        this.preventDef = false;
        this.data = this.createDataObject();
        this.fsm = fsm;
        this.disposable = this.fsm.currentStateObservable().subscribe(current => this.updateEventsRegistered(current[1], current[0]));
        this.activated = true;
        this.asLog = false;
        this.registeredNodes = new Set<EventTarget>();
        this.additionalNodes = new Array<Node>();
        this.mutationObservers = new Array<MutationObserver>();
    }

    protected abstract createDataObject(): D;

    public reinitData(): void {
        this.data.flush();
    }

    public getData(): D {
        return this.data;
    }

    protected updateEventsRegistered(newState: OutputState, oldState: OutputState): void {
        // Do nothing when the interaction has only two nodes: init node and terminal node (this is a single-event interaction).
        if (newState === oldState || this.fsm.getStates().length === 2) {
            return;
        }

        const currEvents: Array<string> = this.getCurrentAcceptedEvents(newState);
        const events: Array<string> = [...this.getEventTypesOf(oldState)];
        const eventsToRemove: Array<string> = events.filter(e => !currEvents.includes(e));
        const eventsToAdd: Array<string> = currEvents.filter(e => !events.includes(e));
        this.registeredNodes.forEach(n => {
            eventsToRemove.forEach(type => this.unregisterEventToNode(type, n));
            eventsToAdd.forEach(type => this.registerEventToNode(type, n));
        });
        this.additionalNodes.forEach(n => {
            n.childNodes.forEach(child => {
                // update the content of the additionalNode
                eventsToRemove.forEach(type => this.unregisterEventToNode(type, child));
                eventsToAdd.forEach(type => this.registerEventToNode(type, child));
            });
        });
    }

    protected getCurrentAcceptedEvents(state: OutputState): Array<string> {
        return [...this.getEventTypesOf(state)];
    }

    private callBackMutationObserver(mutationList: Array<MutationRecord>): void {
        mutationList.forEach(mutation => {
            mutation.addedNodes.forEach(node => this.registerToNodes([node]));
            mutation.removedNodes.forEach(node => this.unregisterFromNodes([node]));
        });
    }

    protected getEventTypesOf(state: OutputState): Set<string> {
        if (state.getTransitions().length === 0) {
            return new Set();
        }

        return state.getTransitions().map(t => t.getAcceptedEvents())
            .reduce((a, b) => new Set([...a, ...b]));
    }

    public registerToNodes(widgets: Array<EventTarget>): void {
        widgets.forEach(w => {
            this.registeredNodes.add(w);
            this.onNewNodeRegistered(w);
        });
    }

    protected unregisterFromNodes(widgets: Array<EventTarget>): void {
        widgets.forEach(w => {
            this.registeredNodes.delete(w);
            this.onNodeUnregistered(w);
        });
    }

    public onNodeUnregistered(node: EventTarget): void {
        this.getEventTypesOf(this.fsm.getCurrentState()).forEach(type => this.unregisterEventToNode(type, node));
    }

    public onNewNodeRegistered(node: EventTarget): void {
        this.getEventTypesOf(this.fsm.getCurrentState()).forEach(type => this.registerEventToNode(type, node));
    }

    public registerToNodeChildren(elementToObserve: Node): void {
        elementToObserve.childNodes.forEach((node: Node) => {
            this.registerToNodes([node]);
        });

        const newMutationObserver = new MutationObserver(mutations => this.callBackMutationObserver(mutations));
        newMutationObserver.observe(elementToObserve, {"childList": true});
        this.mutationObservers.push(newMutationObserver);
    }

    protected registerEventToNode(eventType: string, node: EventTarget): void {
        if (isMouseEvent(eventType)) {
            node.addEventListener(eventType, this.getMouseHandler());
            return;
        }
        if (isTouchEvent(eventType)) {
            node.addEventListener(eventType, this.getTouchHandler());
            return;
        }
        if (isKeyEvent(eventType)) {
            node.addEventListener(eventType, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.scroll === eventType) {
            node.addEventListener(EventRegistrationToken.scroll, this.getUIHandler());

        }
    }

    protected unregisterEventToNode(eventType: string, node: EventTarget): void {
        if (isMouseEvent(eventType)) {
            node.removeEventListener(eventType, this.getMouseHandler());
            return;
        }
        if (isTouchEvent(eventType)) {
            node.removeEventListener(eventType, this.getTouchHandler());
            return;
        }
        if (isKeyEvent(eventType)) {
            node.removeEventListener(eventType, this.getKeyHandler());
            return;
        }
        if (EventRegistrationToken.scroll === eventType) {
            node.removeEventListener(EventRegistrationToken.scroll, this.getUIHandler());

        }
    }

    protected registerActionHandlerClick(node: EventTarget): void {
        node.addEventListener(EventRegistrationToken.click, this.getActionHandler());
        node.addEventListener(EventRegistrationToken.auxclick, this.getActionHandler());
    }

    protected unregisterActionHandlerClick(node: EventTarget): void {
        node.removeEventListener(EventRegistrationToken.click, this.getActionHandler());
        node.removeEventListener(EventRegistrationToken.auxclick, this.getActionHandler());
    }

    protected registerActionHandlerInput(node: EventTarget): void {
        node.addEventListener(EventRegistrationToken.input, this.getActionHandler());
    }

    protected unregisterActionHandlerInput(node: EventTarget): void {
        node.removeEventListener(EventRegistrationToken.input, this.getActionHandler());
    }

    protected getActionHandler(): EventListener {
        if (this.actionHandler === undefined) {
            this.actionHandler = (evt): void => this.processEvent(evt);
        }
        return this.actionHandler;
    }

    protected getMouseHandler(): (e: MouseEvent) => void {
        if (this.mouseHandler === undefined) {
            this.mouseHandler = (evt: MouseEvent): void => this.processEvent(evt);
        }
        return this.mouseHandler;
    }

    protected getTouchHandler(): (e: TouchEvent) => void {
        if (this.touchHandler === undefined) {
            this.touchHandler = (evt: TouchEvent): void => this.processEvent(evt);
        }
        return this.touchHandler;
    }

    protected getKeyHandler(): (e: KeyboardEvent) => void {
        if (this.keyHandler === undefined) {
            this.keyHandler = (evt: KeyboardEvent): void => this.processEvent(evt);
        }
        return this.keyHandler;
    }

    protected getUIHandler(): (e: UIEvent) => void {
        if (this.uiHandler === undefined) {
            this.uiHandler = (evt: UIEvent): void => this.processEvent(evt);
        }
        return this.uiHandler;
    }

    public isRunning(): boolean {
        return this.activated && !(this.fsm.getCurrentState() instanceof InitState);
    }

    public fullReinit(): void {
        this.fsm.fullReinit();
    }

    public set stopImmediatePropagation(stop: boolean) {
        this.stopImmediatePropag = stop;
    }

    /**
     * @return True if the user interaction will stop immidiately the propagation
     * of events processed by this user interaction to others listeners.
     */
    public get stopImmediatePropagation(): boolean {
        return this.stopImmediatePropag;
    }

    public set preventDefault(prevent: boolean) {
        this.preventDef = prevent;
    }

    /**
     * @return True if the default behavior associated to the event will be executed.
     */
    public get preventDefault(): boolean {
        return this.preventDef;
    }

    /**
     * Processes the given UI event.
     * @param event The event to process.
     */
    public processEvent(event: Event): void {
        if (this.isActivated()) {
            this.fsm.process(event);
            if (this.preventDef) {
                event.preventDefault();
            }
            if (this.stopImmediatePropag) {
                event.stopImmediatePropagation();
            }
        }
    }

    public log(log: boolean): void {
        this.asLog = log;
        this.fsm.log(log);
    }


    public isActivated(): boolean {
        return this.activated;
    }

    public setActivated(activated: boolean): void {
        if (this.asLog) {
            catInteraction.info(`Interaction activation: ${String(activated)}`);
        }
        this.activated = activated;
        if (!activated) {
            this.fsm.fullReinit();
        }
    }

    public getFsm(): F {
        return this.fsm;
    }

    public reinit(): void {
        this.fsm.reinit();
        this.reinitData();
    }

    public uninstall(): void {
        this.disposable.unsubscribe();
        this.registeredNodes.forEach(n => this.onNodeUnregistered(n));
        this.registeredNodes.clear();
        this.additionalNodes.forEach(n => this.onNodeUnregistered(n));
        this.additionalNodes.length = 0;
        this.mutationObservers.forEach(m => m.disconnect());
        this.mutationObservers.length = 0;
        this.setActivated(false);
    }
}
