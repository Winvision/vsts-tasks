import * as vsts from 'vso-node-api';
import * as tl from 'vsts-task-lib/task';
import * as GitApi from 'vso-node-api/GitApi';
import * as GitInterfaces from 'vso-node-api/interfaces/GitInterfaces';

export class TfsRestApi {
    private url: string;
    private repositoryId: string;
    private authHandler: any;
    constructor(url: string, token: string, repositoryId: string) {
        this.url = url;
        this.repositoryId = repositoryId;

        tl.debug('Getting handler for Personal Access Token');
        this.authHandler = vsts.getPersonalAccessTokenHandler(token);
    }

    public async CreatePullRequestStatus(pullRequestId: number, statusObject: GitInterfaces.GitPullRequestStatus):
     Promise<GitInterfaces.GitPullRequestStatus> {
        tl.debug('Creating WebApi');
        const webApi = new vsts.WebApi(this.url, this.authHandler);

        tl.debug('Creating GitApi');
        const vstsGit: GitApi.IGitApi = await webApi.getGitApi();

        return new Promise<any>(async (resolve, reject) => {
            try {
                tl.debug('Calling REST API');
                const response = await vstsGit.createPullRequestStatus(statusObject, this.repositoryId, pullRequestId);
                resolve(response);
            } catch (err) {
                reject(err);
            }
        });
    }
}
