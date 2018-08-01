import * as mockanswer from 'vsts-task-lib/mock-answer';
import * as mockrun from 'vsts-task-lib/mock-run';
import * as path from 'path';
import * as shared from './TestShared';

const taskPath = path.join(__dirname, '..', 'index.js');
const tr: mockrun.TaskMockRunner = new mockrun.TaskMockRunner(taskPath);

// Set inputs
console.log(shared.testEnvVars.tfsUrl);
console.log(process.env[shared.testEnvVars.tfsUrl]);
tr.setInput('tfsUrl', process.env[shared.testEnvVars.tfsUrl]);
tr.setInput('token', process.env[shared.testEnvVars.token]);
tr.setInput('repositoryId', process.env[shared.testEnvVars.repositoryId]);
tr.setInput('pullRequestId', process.env[shared.testEnvVars.pullRequestId]);
tr.setInput('state', process.env[shared.testEnvVars.state]);
tr.setInput('description', process.env[shared.testEnvVars.description]);
tr.setInput('name', process.env[shared.testEnvVars.name]);
tr.setInput('genre', process.env[shared.testEnvVars.genre]);
tr.setInput('targetUrl', process.env[shared.testEnvVars.targetUrl]);
console.log('Inputs have been set');

// Create mock for fs module
// tr.registerMock('fs', {
//     writeFileSync: function (filePath: any, contents: any) {
//         // Mock
//     },
//     statSync(path: any, options: any) {
//         return new Stats();
//     }
//     // readFileSync: function(filePath: any, options: any) {
//     //     // Mock: return "";
//     // }
// });

// Provide answers for task mock
const a: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{};
tr.setAnswers(a);

tr.run();