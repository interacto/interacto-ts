#4.3.0

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


#4.2.1

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
