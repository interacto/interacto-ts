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

import {
    CmdStatus,
    CommandsRegistry, FSM,
    FSMImpl,
    InteractionData,
    TerminalState,
    TransitionBase,
    WidgetBindingBase
} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {StubEvent, StubSubEvent1} from "../fsm/StubEvent";
import {InteractionStub} from "../interaction/InteractionStub";


let interaction: InteractionStub;
let binding: WidgetBindingBase<StubCmd, InteractionStub, InteractionData>;
let fsm: FSM;
let cmd: StubCmd;
let whenValue: () => boolean;


class TrStub extends TransitionBase {
    public accept(event: StubEvent): boolean {
        return event instanceof StubSubEvent1;
    }

    public getAcceptedEvents(): Set<string> {
        return new Set(["StubSubEvent1"]);
    }
}

class OneTrFSM extends FSMImpl {
    public constructor() {
        super();
        const s1 = new TerminalState(this, "s1");
        this.addState(s1);
        new TrStub(this.initState, s1);
    }
}

class StubWidgetBinding extends WidgetBindingBase<StubCmd, InteractionStub, InteractionData> {
    public constructor() {
        super(false, interaction, () => cmd, []);
    }

    public when(): boolean {
        return whenValue();
    }
}

beforeEach(() => {
    jest.clearAllMocks();
    whenValue = (): boolean => true;
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
    const dotItSpy = jest.spyOn(cmd, "execute");
    binding.setActivated(false);
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).not.toHaveBeenCalled();
    expect(binding.ifCmdHadEffects).not.toHaveBeenCalledWith();
    expect(binding.ifCmdHadNoEffect).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.created);
});

test("testCmdCreatedExecSavedWhenActivated", () => {
    const dotItSpy = jest.spyOn(cmd, "execute");
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadEffects).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadNoEffect).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
});

test("testCmdKOWhenNotWhenOK", () => {
    whenValue = (): boolean => false;
    const dotItSpy = jest.spyOn(cmd, "execute");
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).not.toHaveBeenCalled();
    expect(binding.ifCmdHadEffects).not.toHaveBeenCalledWith();
    expect(binding.ifCmdHadNoEffect).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.created);
});

test("testCmdKOWhenCannotDoCmd", () => {
    cmd.candoValue = false;
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(new StubSubEvent1());

    expect(cmd.getStatus()).toStrictEqual(CmdStatus.created);
    expect(binding.ifCmdHadEffects).not.toHaveBeenCalledWith();
    expect(binding.ifCmdHadNoEffect).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).toHaveBeenCalledTimes(1);
});

test("testWhenOKCanDoButNoEffect", () => {
    const dotItSpy = jest.spyOn(cmd, "execute");
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    jest.spyOn(cmd, "hadEffect").mockImplementation(() => false);
    fsm.process(new StubSubEvent1());

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadNoEffect).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadEffects).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
});

test("testProducedNone", () => {
    cmd.candoValue = false;
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    expect(cmds).toHaveLength(0);
});

test("testProducedOne", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    expect(cmds).toHaveLength(1);
});

test("testProducedTwo", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(new StubSubEvent1());
    cmd = new StubCmd();
    cmd.candoValue = true;
    fsm.process(new StubSubEvent1());
    expect(cmds).toHaveLength(2);
    expect(cmds[0]).not.toBe(cmds[1]);
});
