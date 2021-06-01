import {CommandBase} from "../CommandBase";
import type {Undoable} from "../../../api/undo/Undoable";

export class TransferArrayItem<T> extends CommandBase implements Undoable {
    private readonly srcArray: Array<T>;

    private readonly tgtArray: Array<T>;

    private readonly srcIndex: number;

    private readonly tgtIndex: number;

    private readonly cmdName: string;

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
}
