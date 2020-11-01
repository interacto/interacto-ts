# 5.1.0

* change(interaction): API change. Transition has now a generic type used by its methods. 
This allowed code simplification in interactions implementations.
* feat(interaction): long press interaction
* feat(interaction): N-clicks interaction
* doc(readme): readme file updated
* test(fsm): tests added
* update(deps): jest deps updated
* Code cleaning operations

# 5.0.0

* feat(binding): new binder shortcut for touch DnD
* feat(binding): new routine 'ifCannotExecute' to use for processing when the command cannot be executed (canExecute)<br/><br/>
* change(api): execution methods of commands renamed to be more explicit
* change(api): separation API / implementation for the whole lib
* change(api): the interaction API does not expose an FSM generic type any more
* change(binding): to create an anonymous binding, use the AnonCmd class. AnonBinder removed
* change(cmd): library commands Zoom, ModifyValue and PositionCommand removed
* change(cmd): renamed base implementation classes with 'base' postfix (InteractionBase, etc.)
* change(error): no more error catcher single instance
* change(interaction): removing this strange feature of the DnD (update source point)<br/><br/>
* clean(all): useless code removed
* clean(all): useless documentation tags removed
* clean(interaction): use arrow functions instead of anon classes<br/><br/>
* config(build): new script command for compiling tests
* config(ci): increasing the code coverage level
* config(deps): various dependencies updated<br/><br/>
* doc(code): doc typo fixed
* doc(readme): readme updated<br/><br/>
* fix(binder): bindings should not expose concrete user interaction in its routines return types
* fix(binding): errors (exceptions) in routines are now captured and logged
* fix(binding): key binders do not allow the 'with', 'then', etc. routines
* fix(binding): key bindings should be able to use strictStart
* fix(binding): the routine StrictStart should be available in interaction binders
* fix(interaction): FSMs that use a sub-FSM do not work when the starting state is not the one by default
* fix(interaction): keys typed interaction must also flush and log its sub interaction
* fix(interaction): the keys typed interaction do not work properly when keys are pressed to be released later
* fix(interaction): the tap interaction should use touchend and not touchstart
* fix(doc): changelog headers fixed
* fix(pkg): main file updated<br/><br/>
* test(all): multiple tests added
* test(mock): use the lib jest-mock-extended for mocking objects


# 4.4.0

* fix(binding): no more optional parameters in binding routines
* fix(code): various code smells fixed thanks to a tslint upgrade
* fix(interaction): double-click does not clean all data on timeout
* fix(interaction): draglock data must set target details on the first double click
* fix(interaction): reinit and log method calls must also be propagated in sub-interactions
* fix(log): better logging in user interactions (in FSMs)
* fix(test): various test smells fixed thanks to tslint jest upgrade
* test(interaction): DragLock and Double Click tests added
* config(npm): useless script cmd removed
* chore(config): jest eslint rules updated
* chore(config): no more audit on package
* chore(git): git repo renamed to interacto-ts


# 4.3.0

* feat(binding): all the interactions should have binding routines in Bindings
* feat(interaction): the event auxclick now supported
* fix(binding): some provided bindings not to expose the good binding interface
* fix(code): eslint conf changes and numerous smells fixed
* fix(config): invalid licence identifier
* fix(interaction): the draglock did not work properly using a non-primary button
* fix(interaction): uninstall a user interaction does not clean everything
* test(binding): tests added
* test(interaction): tests on auxclick added
* chore(doc): changelog file added
* clean(interaction): attributes named or removed
* clean(interaction): useless code removed
* config(jest): jest version updated


# 4.2.1

This is the first stable release after several development versions.

### API Changes

* change(cmd): useless cmd feature removed

### Features

* feat(log): more interaction logging
* feat(binding): binding API for text inputs
* feat(binding): onDynamic for observing (registering) node list content
* feat(binding): preventDefault and stopImmediatePropagation
* feat(binding): widget binding for multi-touch
* feat(interaction): LongTouch interaction
* feat(interaction): new interaction: keys typed
* feat(interaction): swipe and pan interactions
* feat(interaction): swipe interaction
* feat(interaction): tap interaction
* feat(package): adding a script for launching audit
* feat(undo): new methods to get usable messages

### Bug fixes

* fix(binding): uninstall a binding must uninstall its interaction
* fix(chore): jenkinsfile does not consider unstable
* fix(chore): minor rollup fix
* fix(chore): useless files removed
* fix(interaction): console log removed
* fix(interaction): incorrect assertions in tests and incomplete flushing methods
* fix(interaction): multi-touch did not clean data and reuse events correctly
* fix(interaction): multi-touch did not work with bindings
* fix(interaction): nodes dynamically added did not trigger events correctly
* fix(interaction): TouchData vs SrcTgtTouchData
* fix(npm): should use files instead of npmignore
* fix(package): incorrect type index name + imports
* fix(package): security issues fixed (npm audit)
* fix(test): should use the index in imports
* fix(package): useless deps removed
* fix(cmd): constructor of CommandImpl should be public
