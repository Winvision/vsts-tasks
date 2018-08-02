import * as vsts from 'vso-node-api';
import * as tl from 'vsts-task-lib/task';
import * as GitApi from 'vso-node-api/GitApi';
import * as GitInterfaces from 'vso-node-api/interfaces/GitInterfaces';

export class TfsRestApi {
    private url: string;
    private repository: string;
    private project: string;
    private authHandler: any;
    constructor(url: string, token: string, repository: string, project?: string) {
        this.url = url;
        this.repository = repository;
        this.project = project;

        tl.debug('Getting handler for Personal Access Token');
        this.authHandler = vsts.getPersonalAccessTokenHandler(token);
    }

    public async CreatePullRequestStatus(pullRequestId: number, statusObject: GitInterfaces.GitPullRequestStatus):
     Promise<GitInterfaces.GitPullRequestStatus> {
        tl.debug('Creating WebApi');
        const webApi = new vsts.WebApi(this.url, this.authHandler);

        return new Promise<any>(async (resolve, reject) => {
            try {
                tl.debug('Creating GitApi');
                const vstsGit: GitApi.IGitApi = await webApi.getGitApi(this.url);

                tl.debug('Calling REST API');
                if (this.project == null) {
                    resolve(await vstsGit.createPullRequestStatus(statusObject, this.repository, pullRequestId));
                } else {
                    resolve(await vstsGit.createPullRequestStatus(statusObject, this.repository, pullRequestId, this.project));
                }
            } catch (err) {
                if (err.message.indexOf('401') > -1) {
                    reject('Request was unauthorized, please supply a valid token with enough permissions.');
                } else if (err.message.indexOf('undefined') > -1 && err.stack.indexOf('restClient') > -1) {
                    reject('The request yielded no response, please check your connection settings.');
                } else {
                    reject(err);
                }
            }
        });
    }
}
