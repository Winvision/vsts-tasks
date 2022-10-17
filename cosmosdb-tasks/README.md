# Prerequisites: Node and Npm

**Windows and Mac OSX**: Download and install node from [nodejs.org](http://nodejs.org/)

**Linux**: Install [using package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

From a terminal ensure at least node 4.2 and npm 5.6:

```bash
$ node -v && npm -v
v4.2.0
5.6.0
```

To install npm separately:

```
[sudo] npm install npm -g
npm -v
5.6.0
```

Note: On windows if it's still returning npm 2.x run `where npm`. Notice hits in program files. Rename those two npm files and the 3.5.0 in AppData will win.

# Install Dependencies

Once:

```bash
npm install
```

# Build and Test

The instructions below demonstrate how to build and test either all or a specific task.  The output will be sent to
the `_build` directory.  You can then use the [tfx-cli](https://www.npmjs.com/package/tfx-cli) to upload this to your server for testing.

The build will also generate a `tasks.loc.json` and an english strings file under `Strings` in your source tree. You should check these back in. Another localization process will create the other strings files.

## Build All Tasks (this can take a while):

``` bash
npm run build
```

## Build a specific task (recommended):

```bash
node make.js build --task DataMigrationTool
```

## Run Tests

Tests for each task are located in Tests folder for each task. To get additional debugging when you are running your tests, set the environment variable TASK_TEST_TRACE to 1. This will cause additional logging to be printed to STDOUT.

Run tests for all tasks that have been built (i.e. those that exist in the `_build` directory)
```bash
npm test
```

## Update version number on all Tasks:

``` bash
node make.js bump
```

## Update version number on a specific task (recommended):

``` bash
node make.js bump --task DataMigrationTool
```

## Package Tasks:

``` bash
npm run package
```