import * as path from 'path';
import * as assert from 'assert';
import * as mocktest from 'vsts-task-lib/mock-test';
import * as shared from './TestShared';

describe('Pull Request Set Status Suite', function() {
    this.timeout(10000);
    beforeEach(() => {
        delete process.env[shared.testEnvVars.serverUrl];
        delete process.env[shared.testEnvVars.token];
        delete process.env[shared.testEnvVars.repositoryByName];
        delete process.env[shared.testEnvVars.repositoryId];
        delete process.env[shared.testEnvVars.repositoryName];
        delete process.env[shared.testEnvVars.projectName];
        delete process.env[shared.testEnvVars.pullRequestId];
        delete process.env[shared.testEnvVars.state];
        delete process.env[shared.testEnvVars.description];
        delete process.env[shared.testEnvVars.name];
        delete process.env[shared.testEnvVars.genre];
        delete process.env[shared.testEnvVars.targetUrl];
    });

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
        process.env[shared.testEnvVars.serverUrl] = 'somestring';
        process.env[shared.testEnvVars.token] = 'somestring';
        process.env[shared.testEnvVars.repositoryByName] = 'false';
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
        assert(tr.stderr.indexOf('state') > -1 || tr.errorIssues.some((e: string) => e.indexOf('state') > -1),
         'should have written an error message containing "state" to stderr or errorIssues');
        assert(tr.failed, 'task should have failed');
        done();
    });
});