import * as taskLib from 'vsts-task-lib/task';
import * as tr from 'vsts-task-lib/toolrunner';

export async function runDataTool(path: string) : Promise<number> {
    const dt = taskLib.tool(path);

    const sourceType = taskLib.getInput('sourceType', true);
    dt.arg(`/s:${sourceType}`);

    switch (sourceType) {
        case 'JsonFile': {
            addJsonSourceParameters(dt);
            break;
        }
        case 'DocumentDB': {
            addDocumentDBSourceParameters(dt);
            break;
        }
        default: {
            taskLib.error('Unknown source type');
            break;
        }
    }

    const  destinationType = taskLib.getInput('destinationType', true);
    dt.arg(`/t:${destinationType}`);

    switch (destinationType) {
        case 'JsonFile': {
            addJsonDestinationParameters(dt);
            break;
        }
        case 'DocumentDB': {
            addDocumentDBDestinationParameters(dt);
            break;
        }
        default: {
            taskLib.error('Unknown destination type');
            break;
        }
    }

    addOutputParameters(dt);

    return await dt.exec(<tr.IExecOptions>{ });
}

function addJsonSourceParameters(tool: tr.ToolRunner) {
    const sourceJsonFiles = taskLib.getInput('sourceJsonFiles', true);
    const sourceJsonDecompress = taskLib.getBoolInput('sourceJsonDecompress', false);

    tool.arg(`/s.Files:${sourceJsonFiles}`);

    if (sourceJsonDecompress) {
        tool.arg('/s.Decompress');
    }
}

function addDocumentDBSourceParameters(tool: tr.ToolRunner) {
    const sourceDocumentDBConnectionstring = taskLib.getInput('sourceDocumentDBConnectionstring', true);
    const sourceDocumentDBCollection = taskLib.getInput('sourceDocumentDBCollection', true);
    const sourceDocumentDBQueryType = taskLib.getInput('sourceDocumentDBQueryType', true); //inline or filepath
    const sourceDocumentDBQuery = taskLib.getInput('sourceDocumentDBQuery', false);
    const sourceDocumentDBQueryFile = taskLib.getPathInput('sourceDocumentDBQueryFile', false);
    const sourceDocumentDBInternalFields = taskLib.getBoolInput('sourceDocumentDBInternalFields', false);

    tool.arg(`/s.ConnectionString:${sourceDocumentDBConnectionstring}`);
    tool.arg(`/s.Collection:${sourceDocumentDBCollection}`);

    switch (sourceDocumentDBQueryType) {
        case 'inline': {
            if (sourceDocumentDBQuery) {
                tool.arg(`/s.Query:"${sourceDocumentDBQuery}"`);
            }
            break;
        }
        case 'filepath': {
            if (taskLib.filePathSupplied('sourceDocumentDBQueryFile')) {
                if (!taskLib.exist(sourceDocumentDBQueryFile)) {
                    taskLib.setResult(taskLib.TaskResult.Failed, `Query file '${sourceDocumentDBQueryFile}' doesn't exist`);
                    return;
                }

                tool.arg(`/s.QueryFile:"${sourceDocumentDBQueryFile}"`);
            }
            break;
        }
    }

    if (sourceDocumentDBInternalFields) {
        tool.arg('/s.InternalFields');
    }
}

function addJsonDestinationParameters(tool: tr.ToolRunner) {
    const destinationJsonFiles = taskLib.getPathInput('destinationJsonFiles', true);
    const destinationJsonCompress = taskLib.getBoolInput('destinationJsonCompress', false);
    const destinationJsonPrettify = taskLib.getBoolInput('destinationJsonPrettify', false);
    const destinationJsonOverwrite = taskLib.getBoolInput('destinationJsonOverwrite', false);

    tool.arg(`/t.File:${destinationJsonFiles}`);

    if (destinationJsonCompress) {
        tool.arg('/t.Compress');
    }

    if (destinationJsonPrettify) {
        tool.arg('/t.Prettify');
    }

    if (destinationJsonOverwrite) {
        tool.arg('/t.Overwrite');
    }
}

function addDocumentDBDestinationParameters(tool: tr.ToolRunner) {
    const destinationDocumentDBConnectionstring = taskLib.getInput('destinationDocumentDBConnectionstring', true);
    const destinationDocumentDBCollection = taskLib.getInput('destinationDocumentDBCollection', true);
    const destinationDocumentDBCollectionThroughput = taskLib.getInput('destinationDocumentDBCollectionThroughput', false);
    const destinationDocumentDBPartitionKey = taskLib.getInput('destinationDocumentDBPartitionKey', false);
    const destinationDocumentDBIndexingPolicyType = taskLib.getPathInput('destinationDocumentDBIndexingPolicyType', true);
    const destinationDocumentDBIndexingPolicy = taskLib.getInput('destinationDocumentDBIndexingPolicy', false);
    const destinationDocumentDBIndexingPolicyFile = taskLib.getPathInput('destinationDocumentDBIndexingPolicyFile', false);
    const destinationDocumentDBIdField = taskLib.getInput('destinationDocumentDBIdField', false);
    const destinationDocumentDBDisableIdGeneration = taskLib.getBoolInput('destinationDocumentDBDisableIdGeneration', true);
    const destinationDocumentDBUpdateExisting = taskLib.getBoolInput('destinationDocumentDBUpdateExisting', false);
    const destinationDocumentDBParallelRequests = taskLib.getInput('destinationDocumentDBParallelRequests', false);
    const destinationDocumentDBDates = taskLib.getInput('destinationDocumentDBDates', false); // String or Epoch or Both

    tool.arg(`/t.ConnectionString:${destinationDocumentDBConnectionstring}`);
    tool.arg(`/t.Collection:${destinationDocumentDBCollection}`);

    switch (destinationDocumentDBIndexingPolicyType) {
        case 'inline': {
            if (destinationDocumentDBIndexingPolicy) {
                tool.arg(`/t.IndexingPolicy:${destinationDocumentDBIndexingPolicy}`);
            }
            break;
        }
        case 'inline': {
            if (taskLib.filePathSupplied('destinationDocumentDBIndexingPolicyFile')) {
                if (!taskLib.exist(destinationDocumentDBIndexingPolicyFile)) {
                    taskLib.setResult(taskLib.TaskResult.Failed,
                        `Indexing policy file '${destinationDocumentDBIndexingPolicyFile}' doesn't exist`);
                    return;
                }

                tool.arg(`/t.IndexingPolicyFile:${destinationDocumentDBIndexingPolicyFile}`);
            }
            break;
        }
    }

    if (destinationDocumentDBIdField) {
        tool.arg(`/t.IdField:${destinationDocumentDBIdField}`);
    }

    if (destinationDocumentDBCollectionThroughput) {
        tool.arg(`/t.CollectionThroughput:${destinationDocumentDBCollectionThroughput}`);
    }

    if (destinationDocumentDBPartitionKey) {
        tool.arg(`/t.PartitionKey:${destinationDocumentDBPartitionKey}`);
    }

    if (destinationDocumentDBDisableIdGeneration) {
        tool.arg('/t.DisableIdGeneration');
    }

    if (destinationDocumentDBUpdateExisting) {
        tool.arg('/t.UpdateExisting');
    }

    if (destinationDocumentDBParallelRequests) {
        tool.arg(`/t.ParallelRequests:${destinationDocumentDBParallelRequests}`);
    }

    if (destinationDocumentDBDates && destinationDocumentDBDates !== 'String') {
        tool.arg(`/t.Dates:${destinationDocumentDBDates}`);
    }
}

function addOutputParameters(tool: tr.ToolRunner) {
    const logErrorLog = taskLib.getInput('logErrorLog', false);
    const logOverwriteErrorLog = taskLib.getBoolInput('logOverwriteErrorLog', false);

    if (taskLib.filePathSupplied('logErrorLog')) {
        tool.arg(`/ErrorLog:${logErrorLog}`);
    }

    if (logOverwriteErrorLog) {
        tool.arg('/OverwriteErrorLog');
    }
}