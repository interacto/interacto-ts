# 6.0.1

* change(binding): increasing the size of the spring (dnd-1)
* 
* fix(binding): the dnd-1 animations did not work properly
* fix(interaction): long pressure not cancelled on mouse move
* fix(interaction): long touch not cancelled on touch move
* fix(interaction): multi-touch did not copy data correctly
* fix(interaction): some multi-touchs must cancel the interaction on excessive touches
* fix(interaction): tap interaction should not work on move
* fix(interaction): touch DnD failed on simple tap
* fix(interaction): unexpected touches now cancel touch interactions
* fix(doc): incorrect scroll documentation
* 
* clean(test): update eslint + various fixes
* clean(test): use nono API


# 6.0.0

* feat(binder): add reciprocal DnD binder (#67)
* feat(binder): add reciprocal TouchDnD binder (#68)
* feat(interaction): TouchDnD is cancellable and may start on first touch or move (#55)

* change(binder): 'cancel' routine now cumulative (#60)
* change(binder): 'catch' routine now cumulative (#65)
* change(binder): 'endOrCancel' routine now cumulative (#61)
* change(binder): 'ifCannotExecute' routine now cumulative (#64)
* change(binder) 'ifHadEffects' routine now cumulative (#62)
* change(binder) 'ifHadNoEffect' routine now cumulative (#63)
* change(binder): 'end' routine now cumulative (#59)
* change(binder): 'first' routine is cumulative (#57)
 
* doc(binder): documentation on cumulative routines (#66)



# 5.8.0

* change(binder): added isCode option to with() for keyboard interactions (#39)
* change(interaction): Press, Mousemove, Mouseover and Mouseout interactions renamed (#45)

* feat(interaction): added key up, mouse up interactions (#49)
* feat(interaction): added methods to SrcTgtPointsData and MultiTouchData (#50)
* feat(interaction): added Pinch binder and updated Pan and Swipe binders (#53)
* feat(interaction): Wheel interaction added (#44)
* feat(interaction): when routine now usable several times per binder (#52)

* fix(binder): binders can have the throttle routines in all the cases
* fix(binder): key binders do not have the throttle, continuousExecution routines
* fix(binding): catch must be called on crash during the command creation
* fix(interaction): event must not be prevdef or stoppropa if not processed
* fix(interaction): scroll interaction not using correct event type (#43)

* test(all): tests added

* build(deps): bump path-parse from 1.0.6 to 1.0.7 (#54)
* clean(fsm): useless method removed
* config(script): mutation command added


# 5.7.0

* new(binding): binding now have a name and binders can set binding's name
* new(interaction): The DnD interaction now supports the dwell-spring cancellation
* new(logging): new logging system, Fitts law feature preview
* new(command): added UndoNTimes and RedoNTimes commands
* new(interaction): X-Y deltas added to SrcTgtPointsData interaction data
  
* change(api): use property in interfaces instead of Java-like getter/setter
* change(command): made private command properties protected
  
* fix(binding): cancelling the interaction should not rely on hadEffect of the command
* fix(binding): the binding API should not expose FSM handling routines
* fix(command): setProperty and SetProperties should have mutable new values
* fix(interaction): the current position of PointsData not used correctly

* clean: code simplification
* test: tests added
* update: updated TypeScript to version 4.3

# 5.6.0

* feat(bindings): Mousemove binding and user interaction added
* feat(bindings): mouseout and mouseover bindings and user interactions added
* feat(command): Added new command TransferArrayItem (#14)
* feat(command): Added UndoableCommand (#15)
* feat(command): new command setProperties
* feat(command): new command setProperty
* feat(undo): can specify the undo history to the context
  
* config(pkg): irrelevant script cmd removed
* config(deps): dependencies updated

* doc(api): typedoc improved
* doc(build): Added build instructions



# 5.5.0

* new(binder): type aliases for shortening some writing of binders

* change(api): encapsulating the bindings routines into a class
* change(api): moving the undo/redo history into the bindings class. So removing the Single instance.
* change(api): moving implementation classes into the impl folder
* change(api): separating API / implementation of the UndoHistory
* change(api): the error class must be located in the impl folder
* change(api): the useless command registry and the registration policy removed
* change(api): major refactoring of interaction data to match the Web API

* clean(code): code simplification
* clean(code): use 'import type' when possible
* clean(code): use ? instead of undefined when possible
* clean(interaction): simplification of the implementation of interactions

* config(build): build the barrel during the packaging of the lib
* config(linter): allowing type aliasing
* config(pkg): changing the description of the lib in npm

* refactor(interaction): interaction data implementation should not be located in the library folder

* test(cmd): tests added or cleaned


# 5.4.1

* fix(release): incorrect release on NPM

# 5.4.0

* feat(cmd): async command support
* feat(binding): new routine for catching errors, catch #3
* feat(interaction): throttling implemented
* feat(binding): a predefined function for producing two undo/redo bindings
* feat(binding): better support of Angular widget references in 'on'

* change(api): hiding some methods from the binding API
* change(api): interaction data does not expose flush anymore
* change(api): the on routine should take at least one argument
* change(undo): undo collector renamed as undo history
  
* build(deps): dependencies updated

* clean(code): code and test cleaned
  
* doc(api): documentation updated
* doc(config): better documentation generation
  
* fix(undo): error while removing oldest undoable instances
* fix(doc): incorrect documentation on binders

* test(all): new API for testing UI code
* test(binding): implementation of a binding observer to ease unit UI testing
* test(binding): tests added

* config(test): add mutation testing


# 5.3.0

* feat(binding): can set the timeout value of textinput binder
* fix(interaction): n-click interaction only worked on time
* fix(tsdoc): add typedoc eslinter and doc fixed

* improv(code): should use ReadonlyArray when possible
* improv(interaction): should use readonly tuples when possible
* clean(interaction): useless attribute removed
* update(config): keywords added in package.json

# 5.2.0

* change(binding): no reason for the WidgetBinding class to be abstract
* change(binding): widget binding renamed to binding
* change(fsm): a transition supports predefined event types not string type
* fix(config): tests were included in the dist bundle


# 5.1.1

* fix(binding): the new interactions do not have binding shortcuts
* doc(readme): links fixed in readme
* update(deps): type def dep updated
* clean(fsm): code optimisation
* test(interaction,binding): test fixture simplification


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
