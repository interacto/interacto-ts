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
import { InteractionStub } from "../interaction/InteractionStub";
import { InteractionData, WidgetBindingImpl, FSM, CommandsRegistry, TerminalState,
        Transition, OutputState, InputState, CmdStatus } from "../../src";
import { StubCmd } from "../command/StubCmd";
import { StubSubEvent1 } from "../fsm/StubEvent";

let interaction: InteractionStub;
let binding: WidgetBindingImpl<StubCmd, InteractionStub, InteractionData>;
let fsm: FSM;
let cmd: StubCmd;
let whenValue: () => boolean;
let noEffect: number;
let effects: number;
let cannotExec: number;


class TrStub extends Transition {
    public constructor(srcState: OutputState, tgtState: InputState) {
        super(srcState, tgtState);
    }

    public accept(event: Object): boolean {
        return event instanceof StubSubEvent1;
    }

    public isGuardOK(event: Object): boolean {
        return true;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent1"]);
    }
}

class OneTrFSM extends FSM {
    public constructor() {
        super();
        const s1 = new TerminalState(this, "s1");
        this.addState(s1);
        new TrStub(this.initState, s1);
    }
}

class StubWidgetBinding extends WidgetBindingImpl<StubCmd, InteractionStub, InteractionData> {
    public constructor() {
        super(false, interaction, () => cmd, []);
    }
    public when(): boolean {
        return whenValue();
    }
    public ifCmdHadNoEffect(): void {
        noEffect++;
    }
    public ifCmdHadEffects(): void {
        effects++;
    }
    public ifCannotExecuteCmd(): void {
        cannotExec++;
    }
}

beforeEach(() => {
    jest.clearAllMocks();
    noEffect = 0;
    effects = 0;
    cannotExec = 0;
    whenValue = () => true;
    cmd = new StubCmd();
    cmd.candoValue = true;
    fsm = new OneTrFSM();
    interaction = new InteractionStub(fsm);
    binding = new StubWidgetBinding();
});

afterEach(() => {
    CommandsRegistry.getInstance().clear();
});

test("testNothingDoneIsDeactivated", () => {
    const dotItSpy = jest.spyOn(cmd, "doIt");
    binding.setActivated(false);
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).not.toHaveBeenCalled();
    expect(effects).toEqual(0);
    expect(noEffect).toEqual(0);
    expect(cannotExec).toEqual(0);
    expect(cmd.getStatus()).toEqual(CmdStatus.CREATED);
});

test("testCmdCreatedExecSavedWhenActivated", () => {
    const dotItSpy = jest.spyOn(cmd, "doIt");
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(effects).toEqual(1);
    expect(noEffect).toEqual(0);
    expect(cannotExec).toEqual(0);
    expect(cmd.getStatus()).toEqual(CmdStatus.DONE);
});

test("testCmdKOWhenNotWhenOK", () => {
    whenValue = () => false;
    const dotItSpy = jest.spyOn(cmd, "doIt");
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).not.toHaveBeenCalled();
    expect(effects).toEqual(0);
    expect(noEffect).toEqual(0);
    expect(cannotExec).toEqual(0);
    expect(cmd.getStatus()).toEqual(CmdStatus.CREATED);
});

test("testCmdKOWhenCannotDoCmd", () => {
    cmd.candoValue = false;
    fsm.process(new StubSubEvent1());

    expect(cmd.getStatus()).toEqual(CmdStatus.CREATED);
    expect(effects).toEqual(0);
    expect(noEffect).toEqual(0);
    expect(cannotExec).toEqual(1);
});

test("testWhenOKCanDoButNoEffect", () => {
    const dotItSpy = jest.spyOn(cmd, "doIt");
    jest.spyOn(cmd, "hadEffect").mockImplementation(() => false);
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(effects).toEqual(0);
    expect(noEffect).toEqual(1);
    expect(cannotExec).toEqual(0);
});

test("testProducedNone", () => {
    cmd.candoValue = false;
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    expect(cmds.length).toEqual(0);
});

test("testProducedOne", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    expect(cmds.length).toEqual(1);
});

test("testProducedTwo", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    cmd = new StubCmd();
    cmd.candoValue = true;
    fsm.process(new StubSubEvent1());
    expect(cmds.length).toEqual(2);
    expect(cmds[0]).not.toBe(cmds[1]);
});
