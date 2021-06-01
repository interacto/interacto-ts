import {CommandBase} from "../CommandBase";
import type {Undoable} from "../../../api/undo/Undoable";

/**
 * An undoable command that transfers an element from one array to another.
 */
export class TransferArrayItem<T> extends CommandBase implements Undoable {
    /**
     * The array to take the transferred element from.
     */
    private srcArray: Array<T>;

    /**
     * The array to put the transferred element in.
     */
    private tgtArray: Array<T>;

    /**
     * The index at which the element is located in the source array.
     */
    private srcIndex: number;

    /**
     * The index at which the element must be put in the target array.
     */
    private tgtIndex: number;

    /**
     * The name of the command.
     */
    private readonly cmdName: string;

    /**
     * Creates the command.
     * @param srcArray - The array to take the transferred element from.
     * @param tgtArray - The array to put the transferred element in.
     * @param srcIndex - The index at which the element is located in the source array.
     * @param tgtIndex - The index at which the element must be put in the destination array.
     * @param cmdName - The name of the command.
     */
    public constructor(srcArray: Array<T>,
                       tgtArray: Array<T>,
                       srcIndex: number,
                       tgtIndex: number,
                       cmdName: string) {
        super();
        this.srcArray = srcArray;
        this.tgtArray = tgtArray;
        this.srcIndex = srcIndex;
        this.tgtIndex = tgtIndex;
        this.cmdName = cmdName;
    }

    protected execution(): void {
        this.redo();
    }

    public canExecute(): boolean {
        return (this.srcIndex >= 0 && this.srcIndex < this.srcArray.length) &&
            (this.tgtIndex >= 0 && this.tgtIndex <= this.tgtArray.length);
    }

    public getUndoName(): string {
        return this.cmdName;
    }

    public redo(): void {
        const elt = this.srcArray[this.srcIndex];
        this.srcArray.splice(this.srcIndex, 1);
        this.tgtArray.splice(this.tgtIndex, 0, elt);
    }

    public undo(): void {
        const elt = this.tgtArray[this.tgtIndex];
        this.tgtArray.splice(this.tgtIndex, 1);
        this.srcArray.splice(this.srcIndex, 0, elt);
    }

    public getSrcArray(): Array<T> {
        return this.srcArray;
    }

    public setSrcArray(array: Array<T>): void {
        this.srcArray = array;
    }

    public getTgtArray(): Array<T> {
        return this.tgtArray;
    }

    public setTgtArray(array: Array<T>): void {
        this.tgtArray = array;
    }

    public getSrcIndex(): number {
        return this.srcIndex;
    }

    public setSrcIndex(index: number): void {
        this.srcIndex = index;
    }

    public getTgtIndex(): number {
        return this.tgtIndex;
    }

    public setTgtIndex(index: number): void {
        this.tgtIndex = index;
    }
}
