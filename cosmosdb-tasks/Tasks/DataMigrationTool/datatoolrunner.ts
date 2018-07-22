import * as taskLib from 'vsts-task-lib/task';
import * as tr from 'vsts-task-lib/toolrunner';

export async function runDataTool(path: string) : Promise<number> {

    var dt = taskLib.tool(path);
    
    let sourceType = taskLib.getInput('sourceType', true);
    dt.arg(`/s:${sourceType}`);

    switch(sourceType) { 
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

    let destinationType = taskLib.getInput('destinationType', true);
    dt.arg(`/t:${destinationType}`);

    switch(destinationType) { 
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
    let sourceJsonFiles = taskLib.getInput('sourceJsonFiles', true);
    let sourceJsonDecompress = taskLib.getBoolInput('sourceJsonDecompress', false);
    
    tool.arg(`/s.Files:${sourceJsonFiles}`);

    if (sourceJsonDecompress)
    {
        tool.arg('/s.Decompress');
    }
}

function addDocumentDBSourceParameters(tool: tr.ToolRunner) {
    let sourceDocumentDBConnectionstring = taskLib.getInput('sourceDocumentDBConnectionstring', true);
    let sourceDocumentDBCollection = taskLib.getInput('sourceDocumentDBCollection', true);
    let sourceDocumentDBQueryType = taskLib.getInput('sourceDocumentDBQueryType', true); //inline or filepath
    let sourceDocumentDBQuery = taskLib.getInput('sourceDocumentDBQuery', false);
    let sourceDocumentDBQueryFile = taskLib.getPathInput('sourceDocumentDBQueryFile', false);
    let sourceDocumentDBInternalFields = taskLib.getBoolInput('sourceDocumentDBInternalFields', false);
 
    tool.arg(`/s.ConnectionString:${sourceDocumentDBConnectionstring}`);
    tool.arg(`/s.Collection:${sourceDocumentDBCollection}`);

    switch(sourceDocumentDBQueryType){
        case 'inline': {
            if(sourceDocumentDBQuery) {
                tool.arg(`/s.Query:"${sourceDocumentDBQuery}"`);
            }
            break;
        }
        case 'filepath': {
            if (taskLib.filePathSupplied('sourceDocumentDBQueryFile')){
                if (!taskLib.exist(sourceDocumentDBQueryFile)) {
                    taskLib.setResult(taskLib.TaskResult.Failed, `Query file '${sourceDocumentDBQueryFile}' doesn't exist`);
                    return;
                }

                tool.arg(`/s.QueryFile:"${sourceDocumentDBQueryFile}"`);
            }
            break;
        }
    }

    if (sourceDocumentDBInternalFields){
        tool.arg('/s.InternalFields');
    }
}

function addJsonDestinationParameters(tool: tr.ToolRunner){
    let destinationJsonFiles = taskLib.getPathInput('destinationJsonFiles', true);
    let destinationJsonCompress = taskLib.getBoolInput('destinationJsonCompress', false);
    let destinationJsonPrettify = taskLib.getBoolInput('destinationJsonPrettify', false);
    let destinationJsonOverwrite = taskLib.getBoolInput('destinationJsonOverwrite', false);

    tool.arg(`/t.File:${destinationJsonFiles}`);

    if (destinationJsonCompress){
        tool.arg('/t.Compress');
    }

    if (destinationJsonPrettify){
        tool.arg('/t.Prettify');
    }

    if (destinationJsonOverwrite){
        tool.arg('/t.Overwrite');
    }
}

function addDocumentDBDestinationParameters(tool: tr.ToolRunner){
    let destinationDocumentDBConnectionstring = taskLib.getInput('destinationDocumentDBConnectionstring', true);
    let destinationDocumentDBCollection = taskLib.getInput('destinationDocumentDBCollection', true);
    let destinationDocumentDBCollectionThroughput = taskLib.getInput('destinationDocumentDBCollectionThroughput', false);
    let destinationDocumentDBPartitionKey = taskLib.getInput('destinationDocumentDBPartitionKey', false);
    let destinationDocumentDBIndexingPolicyType = taskLib.getPathInput('destinationDocumentDBIndexingPolicyType', true); // inline or filePath
    let destinationDocumentDBIndexingPolicy = taskLib.getInput('destinationDocumentDBIndexingPolicy', false);
    let destinationDocumentDBIndexingPolicyFile = taskLib.getPathInput('destinationDocumentDBIndexingPolicyFile', false);
    let destinationDocumentDBIdField = taskLib.getInput('destinationDocumentDBIdField', false);
    let destinationDocumentDBDisableIdGeneration = taskLib.getBoolInput('destinationDocumentDBDisableIdGeneration', true);
    let destinationDocumentDBUpdateExisting = taskLib.getBoolInput('destinationDocumentDBUpdateExisting', false);
    let destinationDocumentDBParallelRequests = taskLib.getInput('destinationDocumentDBParallelRequests', false);
    let destinationDocumentDBDates = taskLib.getInput('destinationDocumentDBDates', false); // String or Epoch or Both

    tool.arg(`/t.ConnectionString:${destinationDocumentDBConnectionstring}`);
    tool.arg(`/t.Collection:${destinationDocumentDBCollection}`);

    switch (destinationDocumentDBIndexingPolicyType){
        case 'inline': {
            if(destinationDocumentDBIndexingPolicy) {
                tool.arg(`/t.IndexingPolicy:${destinationDocumentDBIndexingPolicy}`);
            }
            break;
        }
        case 'inline': {
            if(taskLib.filePathSupplied('destinationDocumentDBIndexingPolicyFile')) {
                if (!taskLib.exist(destinationDocumentDBIndexingPolicyFile)) {
                    taskLib.setResult(taskLib.TaskResult.Failed, `Indexing policy file '${destinationDocumentDBIndexingPolicyFile}' doesn't exist`);
                    return;
                }

                tool.arg(`/t.IndexingPolicyFile:${destinationDocumentDBIndexingPolicyFile}`);
            }
            break;
        }
    }

    if (destinationDocumentDBIdField){
        tool.arg(`/t.IdField:${destinationDocumentDBIdField}`);
    }

    if (destinationDocumentDBCollectionThroughput)
    {
        tool.arg(`/t.CollectionThroughput:${destinationDocumentDBCollectionThroughput}`);
    }

    if (destinationDocumentDBPartitionKey)
    {
        tool.arg(`/t.PartitionKey:${destinationDocumentDBPartitionKey}`);
    }

    if (destinationDocumentDBDisableIdGeneration)
    {
        tool.arg('/t.DisableIdGeneration');
    }

    if (destinationDocumentDBUpdateExisting)
    {
        tool.arg('/t.UpdateExisting');
    }

    if (destinationDocumentDBParallelRequests)
    {
        tool.arg(`/t.ParallelRequests:${destinationDocumentDBParallelRequests}`);
    }

    if (destinationDocumentDBDates && destinationDocumentDBDates !== 'String')
    {
        tool.arg(`/t.Dates:${destinationDocumentDBDates}`);
    }
}

function addOutputParameters(tool: tr.ToolRunner){
    let logErrorLog = taskLib.getInput('logErrorLog', false);
    let logOverwriteErrorLog = taskLib.getBoolInput('logOverwriteErrorLog', false);

    if (taskLib.filePathSupplied('logErrorLog')){
        tool.arg(`/ErrorLog:${logErrorLog}`);
    }

    if (logOverwriteErrorLog){
        tool.arg('/OverwriteErrorLog');
    }
}