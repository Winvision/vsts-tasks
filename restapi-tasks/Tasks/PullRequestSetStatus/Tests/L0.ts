import * as path from 'path';
import * as assert from 'assert';
import * as mocktest from 'vsts-task-lib/mock-test';
import * as shared from './TestShared';

describe('Pull Request Set Status Suite', function() {
    this.timeout(10000);
    beforeEach(() => {
        delete process.env[shared.testEnvVars.state];
        //mock();
    });
    //afterEach(mock.restore);

    it('Fails with no arguments', (done: Mocha.Done) => {
        // Set the parameters for this test
        const tp = path.join(__dirname, 'TestSetup.js');
        const tr : mocktest.MockTestRunner = new mocktest.MockTestRunner(tp);

        // Run the test
        tr.run();

        // Assert the result
        assert(tr.stderr.length > 0 || tr.errorIssues.length > 0, 'should have written to stderr or errorIssues');
        assert(tr.failed, 'task should have failed');
        done();
    });

    it('Fails for unknown state', (done: Mocha.Done) => {
        // Set the parameters for this test
        const tp = path.join(__dirname, 'TestSetup.js');
        const tr : mocktest.MockTestRunner = new mocktest.MockTestRunner(tp);
        process.env[shared.testEnvVars.tfsUrl] = 'somestring';
        process.env[shared.testEnvVars.token] = 'somestring';
        process.env[shared.testEnvVars.repositoryId] = 'somestring';
        process.env[shared.testEnvVars.pullRequestId] = 'somestring';
        process.env[shared.testEnvVars.state] = 'someunknownstate';
        process.env[shared.testEnvVars.description] = 'somestring';
        process.env[shared.testEnvVars.name] = 'somestring';
        process.env[shared.testEnvVars.genre] = 'somestring';
        process.env[shared.testEnvVars.targetUrl] = 'somestring';

        // Run the test
        tr.run();

        // Assert the result
        assert(tr.stderr.length > 0 || tr.errorIssues.length > 0, 'should have written to stderr or errorIssues');
        assert(tr.stderr.indexOf('state') > 0 || tr.errorIssues.some((e: string) => e.indexOf('state') > 0),
         'should have written an error message containing "state" to stderr or errorIssues');
        assert(tr.failed, 'task should have failed');
        done();
    });
});