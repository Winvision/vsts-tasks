import * as toolLib from 'vsts-task-tool-lib/tool';
import * as taskLib from 'vsts-task-lib/task';
import * as restm from 'typed-rest-client/RestClient';
import * as path from 'path';
import * as semver from 'semver';

export async function getDataTool(versionSpec: string, addToolToPath?: boolean): Promise<string> {

    let toolPath: string;
    taskLib.debug('Trying to get tool from local cache');
    toolPath = toolLib.findLocalTool('cosmosdt', versionSpec);
    
    if (!toolPath) {
        let version = semver.clean(versionSpec);
        let v = `${semver.major(version)}.${semver.minor(version)}`
        let url = `https://download.microsoft.com/download/E/1/4/E143A339-41AE-4E0E-9CC8-911C0B663478/dt-${v}.zip`;

        taskLib.debug('Downloading version: ' + url);
        let downloadPath: string = await toolLib.downloadTool(url);

        // Extract
        let extPath = await toolLib.extractZip(downloadPath);
        console.log(extPath);
        toolPath = await toolLib.cacheDir(extPath, 'cosmosdt', versionSpec);
    }

    if (addToolToPath){
        console.log(taskLib.loc("Info_UsingToolPath", toolPath));
        toolLib.prependPath(toolPath);
    }

    return path.join(toolPath, 'dt.exe');
}