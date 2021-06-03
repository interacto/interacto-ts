# Building the project

Before building the project for the first time, make sure that all dependencies are installed with `npm install`.

Then use `npm run package` to build the project.

## On Windows

If you are building on a Windows machine, you might see the error "rm -rf... command not found" appear.
To fix this, you can use the following command to make npm use Git Bash instead of the Windows command line interpreter:

`npm config set script-shell "C:\Program Files\Git\bin\bash.exe"`

(The last part may change depending on your Git install location)
