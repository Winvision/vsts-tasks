import * as toolLib from 'vsts-task-tool-lib/tool';
import * as taskLib from 'vsts-task-lib/task';
import * as tr from 'vsts-task-lib/toolrunner';
import * as path from "path";
import datatoolDownloader = require('./datatooldownloader');
import datatoolRunner = require('./datatoolrunner');

async function run() {
    let dataToolPath: string;

    try {
        taskLib.setResourcePath(path.join(__dirname, "task.json"));

        dataToolPath = await datatoolDownloader.getDataTool('1.7.0',  true);
    }
    catch (error) {
        console.error('ERR:' + error.message);
        taskLib.setResult(taskLib.TaskResult.Failed, "");
    }

    datatoolRunner.runDataTool(dataToolPath).catch((reason) => taskLib.setResult(taskLib.TaskResult.Failed, reason));
}

run();