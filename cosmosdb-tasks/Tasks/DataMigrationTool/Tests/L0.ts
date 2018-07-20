import assert = require('assert');
import path = require('path');
import os = require('os');
import process = require('process');
import fs = require('fs');

import * as ttm from 'vsts-task-lib/mock-test';

describe('Data Migration Tool L0 Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 20000);

    it('should fail when DataMigrationTool is run with no working, tools or temp directory', (done) => {
        const testPath: string = path.join(__dirname, 'L0FailsIfNoDirectorySet.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(testPath);

        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool once');
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        //assert(tr.succeeded, 'task should have succeeded');
        done();
    });
});
