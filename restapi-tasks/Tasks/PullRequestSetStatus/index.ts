import * as tl from 'vsts-task-lib/task';
import { TfsRestApi } from './TfsRestApi';
import * as GitInterfaces from 'vso-node-api/interfaces/GitInterfaces';

async function run() {
    try {
        console.log('Starting TFSPullRequestSetStatus task');

        const tfsUrl = tl.getInput('tfsUrl', true);
        const token = tl.getInput('token', true);
        const repositoryId = tl.getInput('repositoryId', true);
        const pullRequestId = tl.getInput('pullRequestId', true);
        const state = tl.getInput('state', true);
        const description = tl.getInput('description', true);
        const name = tl.getInput('name', true);
        const genre = tl.getInput('genre', true);
        const targetUrl = tl.getInput('targetUrl', true);

        tl.debug('Determining requested state');
        let stateVal = GitInterfaces.GitStatusState.NotSet;
        switch (state) {
            case 'error':
                stateVal = GitInterfaces.GitStatusState.Error;
                break;
            case 'failed':
                stateVal = GitInterfaces.GitStatusState.Failed;
                break;
            case 'notApplicable':
                stateVal = GitInterfaces.GitStatusState.NotApplicable;
                break;
            case 'pending':
                stateVal = GitInterfaces.GitStatusState.Pending;
                break;
            case 'succeeded':
                stateVal = GitInterfaces.GitStatusState.Succeeded;
                break;
        }

        tl.debug('Constructing status object body');
        const statusObject: GitInterfaces.GitPullRequestStatus = {
            'iterationId': null,
            'properties': null,
            '_links': null,
            'createdBy': null,
            'creationDate': null,
            'updatedDate': null,
            'id': null,
            'state': stateVal,
            'description': description,
            'context': {
                'name': name,
                'genre': genre
            },
            'targetUrl': targetUrl
        };

        tl.debug('Initialising TfsRestApi');
        const tfsRestApi = new TfsRestApi(tfsUrl, token, repositoryId);

        tl.debug('Casting Pull Request ID to number');
        const pullRequestNumber = Number(pullRequestId);

        console.log(`Creating Pull Request status '${genre}/${name}' for Pull Request '${pullRequestId}' to '${state}'`);
        const pullRequestStatus = await tfsRestApi.CreatePullRequestStatus(pullRequestNumber, statusObject);
        if (pullRequestStatus.state === statusObject.state) {
            console.log(`Successfully set the Pull Request status '${genre}/${name}' for Pull Request '${pullRequestId}' to '${state}'`);
            tl.setResult(tl.TaskResult.Succeeded, 'Successfully set the Pull Request status');
        } else {
            tl.error(`Could not set the Pull Request status '${genre}/${name}' for Pull Request '${pullRequestId}'`);
            tl.setResult(tl.TaskResult.Failed, 'Could not set the Pull Request status');
        }
    } catch (err) {
        tl.error(err);
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
