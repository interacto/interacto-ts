/* eslint-disable unicorn/no-null */
import type {Flushable} from "./Flushable";
import type {UnitInteractionData} from "../../api/interaction/UnitInteractionData";

export abstract class InteractionDataBase implements UnitInteractionData, Flushable {
    protected currentTargetData: EventTarget | null = null;

    protected targetData: EventTarget | null = null;

    protected timeStampData = 0;

    public copy(data: UnitInteractionData): void {
        /*
         * Cannot use Object.assign because of a strange implementation of Event
         * that prevents accessing the properties
         */
        this.currentTargetData = data.currentTarget;
        this.targetData = data.target;
        this.timeStampData = data.timeStamp;
    }

    public flush(): void {
        this.currentTargetData = null;
        this.targetData = null;
        this.timeStampData = 0;
    }

    public get currentTarget(): EventTarget | null {
        return this.currentTargetData;
    }

    public get target(): EventTarget | null {
        return this.targetData;
    }

    public get timeStamp(): number {
        return this.timeStampData;
    }
}
