import * as taskLib from 'vsts-task-lib';
import * as path from 'path';
import * as datatoolDownloader from './datatooldownloader';
import * as datatoolRunner from './datatoolrunner';

async function run() {
    let dataToolPath: string;

    try {
        taskLib.setResourcePath(path.join(__dirname, 'task.json'));

        const versionSpec = taskLib.getInput('versionSpec', true);
        dataToolPath = await datatoolDownloader.getDataTool(versionSpec, true);
    } catch (error) {
        console.error('ERR:' + error.message);
        taskLib.setResult(taskLib.TaskResult.Failed, '');
    }

    datatoolRunner.runDataTool(dataToolPath).catch((reason) => taskLib.setResult(taskLib.TaskResult.Failed, reason));
}

run();
