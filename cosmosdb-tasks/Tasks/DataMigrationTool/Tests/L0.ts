import * as assert from 'assert';
import * as path from 'path';
import * as process from 'process';
import * as mocktest from 'azure-pipelines-task-lib/mock-test';

describe('Data Migration Tool L0 Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 20000);

    it('Should fail when DataMigrationTool is run with no working, tools or temp directory', (done) => {
        const testPath: string = path.join(__dirname, 'L0FailsIfNoDirectorySet.js');
        const tr: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        tr.run();

        assert(tr.stderr.length > 0 || tr.errorIssues.length > 0, 'task should have written to stderr');
        assert(tr.failed, 'task should have failed');
        done();
    });
});
