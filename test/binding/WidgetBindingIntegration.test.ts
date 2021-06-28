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

import type {FSM, InteractionData, UndoHistory, Logger} from "../../src/interacto";
import {BindingImpl, ClickTransition, CmdStatus, FSMImpl, TerminalState, UndoHistoryImpl} from "../../src/interacto";
import {StubCmd} from "../command/StubCmd";
import {InteractionStub} from "../interaction/InteractionStub";
import {createMouseEvent} from "../interaction/StubEvents";
import {mock} from "jest-mock-extended";


let interaction: InteractionStub;
let binding: BindingImpl<StubCmd, InteractionStub, InteractionData>;
let fsm: FSM;
let cmd: StubCmd;
let history: UndoHistory;

class OneTrFSM extends FSMImpl {
    public constructor() {
        super();
        const s1 = new TerminalState(this, "s1");
        this.addState(s1);
        new ClickTransition(this.initState, s1);
    }
}

beforeEach(() => {
    history = new UndoHistoryImpl();
    jest.clearAllMocks();
    cmd = new StubCmd();
    cmd.candoValue = true;
    fsm = new OneTrFSM();
    interaction = new InteractionStub(fsm);
    binding = new BindingImpl(false, interaction, () => cmd, [], history, mock<Logger>());
});

afterEach(() => {
    history.clear();
});

test("testNothingDoneIsDeactivated", () => {
    const dotItSpy = jest.spyOn(cmd, "execute");
    binding.setActivated(false);
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(createMouseEvent("click", document.createElement("button")));

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
    fsm.process(createMouseEvent("click", document.createElement("button")));

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadEffects).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadNoEffect).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
    expect(cmd.getStatus()).toStrictEqual(CmdStatus.done);
});

test("testCmdKOWhenNotWhenOK", () => {
    jest.spyOn(binding, "when").mockReturnValue(false);
    const dotItSpy = jest.spyOn(cmd, "execute");
    jest.spyOn(binding, "ifCmdHadNoEffect");
    jest.spyOn(binding, "ifCmdHadEffects");
    jest.spyOn(binding, "ifCannotExecuteCmd");
    fsm.process(createMouseEvent("click", document.createElement("button")));

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
    fsm.process(createMouseEvent("click", document.createElement("button")));

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
    fsm.process(createMouseEvent("click", document.createElement("button")));

    expect(dotItSpy).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadNoEffect).toHaveBeenCalledTimes(1);
    expect(binding.ifCmdHadEffects).not.toHaveBeenCalledWith();
    expect(binding.ifCannotExecuteCmd).not.toHaveBeenCalledWith();
});

test("testProducedNone", () => {
    cmd.candoValue = false;
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(createMouseEvent("click", document.createElement("button")));
    expect(cmds).toHaveLength(0);
});

test("testProducedOne", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(createMouseEvent("click", document.createElement("button")));
    expect(cmds).toHaveLength(1);
});

test("testProducedTwo", () => {
    const cmds = new Array<StubCmd>();
    binding.produces().subscribe(elt => cmds.push(elt));

    fsm.process(createMouseEvent("click", document.createElement("button")));
    cmd = new StubCmd();
    cmd.candoValue = true;
    fsm.process(createMouseEvent("click", document.createElement("button")));
    expect(cmds).toHaveLength(2);
    expect(cmds[0]).not.toBe(cmds[1]);
});
