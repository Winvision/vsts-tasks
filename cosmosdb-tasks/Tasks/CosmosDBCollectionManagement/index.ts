import * as taskLib from 'azure-pipelines-task-lib/task';
import * as sh from 'shelljs';
import {CosmosDb} from './cosmosdb';

async function run(): Promise<void> {
    try
    {
        let actionType = taskLib.getInput('actionType', true);
        let cosmosDBConnectionstring = taskLib.getInput('cosmosDBConnectionstring', true);
        let cosmosDBCollection = taskLib.getInput('cosmosDBCollection', true);

        let cosmosDBCollectionCreateIfNotExists = taskLib.getBoolInput('cosmosDBCollectionCreateIfNotExists', true);

        let connectionString = ParseConnectionString(cosmosDBConnectionstring);
        let client = new CosmosDb(connectionString.hostName, connectionString.key)

        let cosmosDBCollectionThroughput = taskLib.getInput('cosmosDBCollectionThroughput', false);
        let cosmosDBPartitionKey = taskLib.getInput('cosmosDBPartitionKey', false);
        let cosmosDBTimeToLive = taskLib.getInput('cosmosDBTimeToLive', false);
        let cosmosDBIndexingPolicyType = taskLib.getInput('cosmosDBIndexingPolicyType', false); // inline or filePath 
        let cosmosDBIndexingPolicy = taskLib.getInput('cosmosDBIndexingPolicy', false);
        let cosmosDBIndexingPolicyFile = taskLib.getPathInput('cosmosDBIndexingPolicyFile', false);

        let indexingPolicy: null;
        switch(cosmosDBIndexingPolicyType){
            case 'inline': {
                if (cosmosDBIndexingPolicy){
                    indexingPolicy =  JSON.parse(cosmosDBIndexingPolicy);
                }
                break;
            }
            case 'filePath': {
                if (cosmosDBIndexingPolicyFile) {
                    if (!taskLib.exist(cosmosDBIndexingPolicyFile)) {
                        taskLib.setResult(taskLib.TaskResult.Failed, `Indexing policy file '${cosmosDBIndexingPolicyFile}' does not exist`);
                        return;
                    }

                    let indexPolicyFileBody = sh.cat(cosmosDBIndexingPolicyFile);
                    if (indexPolicyFileBody == null || indexPolicyFileBody === '') {
                        taskLib.setResult(taskLib.TaskResult.Failed, `Indexing policy file '${cosmosDBIndexingPolicyFile}' could not be read`);
                        return;
                    }

                    indexingPolicy = JSON.parse(indexPolicyFileBody);
                }
                break;
            }
        }

        switch(actionType) {
            case 'Create': {
                await client.CreateCollection(connectionString.database, cosmosDBCollection, cosmosDBCollectionThroughput, cosmosDBPartitionKey, cosmosDBTimeToLive, indexingPolicy);
                break;
            }
            case 'Update': {
                await client.UpdateCollection(connectionString.database, cosmosDBCollection, cosmosDBCollectionThroughput, cosmosDBPartitionKey, cosmosDBTimeToLive, indexingPolicy, cosmosDBCollectionCreateIfNotExists);
                break;
            }
            case 'Delete': {
                await client.DeleteCollection(connectionString.database, cosmosDBCollection);
                break;
            }
        }
    }
    catch(error) {
        taskLib.setResult(taskLib.TaskResult.Failed, error);
    }
}

interface IConnectionString {
    hostName: string;
    key: string;
    database: string;
}

function ParseConnectionString(cs: string) : IConnectionString {
    let connection : IConnectionString = {
        hostName: "",
        key: "",
        database: ""
    }
    cs = cs.trim();
    let parts = cs.split(';')
    parts.forEach(element => {
        var values = element.split(/=(.+)/);
        switch (values[0].toLowerCase())
        {
            case 'accountendpoint' : {
                connection.hostName = values[1];
                break;
            }
            case 'accountkey' : {
                connection.key = values[1];
                break;
            }
            case 'database' : {
                connection.database = values[1];
                break;
            }
        }
    });    

    return connection;
}

run();