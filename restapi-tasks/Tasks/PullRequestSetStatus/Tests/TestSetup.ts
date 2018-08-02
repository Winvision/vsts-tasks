import * as mockanswer from 'vsts-task-lib/mock-answer';
import * as mockrun from 'vsts-task-lib/mock-run';
import * as path from 'path';
import * as shared from './TestShared';

const taskPath = path.join(__dirname, '..', 'index.js');
const tr: mockrun.TaskMockRunner = new mockrun.TaskMockRunner(taskPath);

// Set inputs
tr.setInput('serverUrl', process.env[shared.testEnvVars.serverUrl]);
tr.setInput('token', process.env[shared.testEnvVars.token]);
tr.setInput('repositoryByName', process.env[shared.testEnvVars.repositoryByName]);
tr.setInput('repositoryId', process.env[shared.testEnvVars.repositoryId]);
tr.setInput('repositoryName', process.env[shared.testEnvVars.repositoryName]);
tr.setInput('projectName', process.env[shared.testEnvVars.projectName]);
tr.setInput('pullRequestId', process.env[shared.testEnvVars.pullRequestId]);
tr.setInput('state', process.env[shared.testEnvVars.state]);
tr.setInput('description', process.env[shared.testEnvVars.description]);
tr.setInput('name', process.env[shared.testEnvVars.name]);
tr.setInput('genre', process.env[shared.testEnvVars.genre]);
tr.setInput('targetUrl', process.env[shared.testEnvVars.targetUrl]);
console.log('Inputs have been set');

// Provide answers for task mock
const a: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{};
tr.setAnswers(a);
console.log('Answers have been set.');

tr.run();