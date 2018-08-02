import * as mockanswer from 'vsts-task-lib/mock-answer';
import * as mockrun from 'vsts-task-lib/mock-run';
import * as mockrunner from 'vsts-task-lib/mock-toolrunner';
import * as mocktool from './mock_node_modules/tool';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tr: mockrun.TaskMockRunner = new mockrun.TaskMockRunner(taskPath);

process.env['AGENT_VERSION'] = '2.116.0';
process.env['SYSTEM_DEFAULTWORKINGDIRECTORY'] = 'DefaultWorkingDirectory';
process.env['AGENT_TEMPDIRECTORY'] = 'c:\\somedir\\temp';
process.env['AGENT_WORKFOLDER'] = 'c:\\somedir\\work';

// Set up mock services
tr.registerMock('fs', {
    writeFileSync: function (filePath: any, contents: any) {
        // Mock
    }
});
tr.registerMock('vsts-task-lib/toolrunner', mockrunner);
tr.registerMock('vsts-task-tool-lib/tool', mocktool);

// Provide answers for task mock
const a: mockanswer.TaskLibAnswers = <mockanswer.TaskLibAnswers>{};
tr.setAnswers(a);

tr.run();