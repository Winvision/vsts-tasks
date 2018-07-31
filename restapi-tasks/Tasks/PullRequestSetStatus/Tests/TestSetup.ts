import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
import * as shared from './TestShared';

const DefaultWorkingDirectory: string = shared.formatPath("a/w");
const ImageNamesPath = shared.formatPath("dir/image_names.txt");
const DockerFilePath = shared.formatPath('dir1/DockerFile');

let taskPath = path.join(__dirname, '..', 'container.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

tr.setInput('containerregistrytype', process.env[shared.TestEnvVars.containerType] || shared.ContainerTypes.ContainerRegistry);
tr.setInput('command', process.env[shared.TestEnvVars.command] || shared.CommandTypes.buildImage);
tr.setInput('imageName', process.env[shared.TestEnvVars.imageName] || 'test/test:2');
tr.setInput('imageNamesPath', ImageNamesPath);
tr.setInput('dockerRegistryEndpoint', 'dockerhubendpoint');
tr.setInput('dockerFile', DockerFilePath);
tr.setInput('includeLatestTag', process.env[shared.TestEnvVars.includeLatestTag] || "false");
tr.setInput('qualifyImageName', process.env[shared.TestEnvVars.qualifyImageName] || "false");
tr.setInput('azureSubscriptionEndpoint', 'AzureRMSpn');
tr.setInput('azureContainerRegistry', '{"loginServer":"ajgtestacr1.azurecr.io", "id" : "/subscriptions/c00d16c7-6c1f-4c03-9be1-6934a4c49682/resourcegroups/ajgtestacr1rg/providers/Microsoft.ContainerRegistry/registries/ajgtestacr1"}')
tr.setInput('enforceDockerNamingConvention', process.env[shared.TestEnvVars.enforceDockerNamingConvention]);
tr.setInput('memoryLimit', process.env[shared.TestEnvVars.memoryLimit] || '');
tr.setInput('pushMultipleImages', process.env[shared.TestEnvVars.pushMultipleImages] || "false");
tr.setInput('tagMultipleImages', process.env[shared.TestEnvVars.tagMultipleImages] || "false");
tr.setInput('arguments', process.env[shared.TestEnvVars.arguments] || '');

console.log("Inputs have been set");

process.env["RELEASE_RELEASENAME"] = "Release-1";
process.env["SYSTEM_DEFAULTWORKINGDIRECTORY"] =  DefaultWorkingDirectory;
process.env["SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"] = "https://abc.visualstudio.com/";
process.env["SYSTEM_SERVERTYPE"] = "hosted";
process.env["ENDPOINT_AUTH_dockerhubendpoint"] = "{\"parameters\":{\"username\":\"test\", \"password\":\"regpassword\", \"email\":\"test@microsoft.com\",\"registry\":\"https://index.docker.io/v1/\"},\"scheme\":\"UsernamePassword\"}";
process.env["ENDPOINT_AUTH_SCHEME_AzureRMSpn"] = "ServicePrincipal";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALID"] = "spId";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_SERVICEPRINCIPALKEY"] = "spKey";
process.env["ENDPOINT_AUTH_PARAMETER_AzureRMSpn_TENANTID"] = "tenant";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONNAME"] = "sName";
process.env["ENDPOINT_DATA_AzureRMSpn_SUBSCRIPTIONID"] =  "sId";
process.env["ENDPOINT_DATA_AzureRMSpn_SPNOBJECTID"] =  "oId";

// provide answers for task mock
let a = {
    "which": {
        "docker": "docker"
    },
     "checkPath": {
        "docker": true,
        [ImageNamesPath]: true
    },
    "exist": {
        "docker": true,
        [ImageNamesPath]: true
    },
    "exec": {
       "docker push test/test:2" : {
           "code": 0,
            "stdout": "successfully pushed test/test:2 image"
       },
       "docker run --rm test/test:2" : {
           "code": 0,
            "stdout": "successfully ran test/test:2 image"
       },
       "docker run --rm -m 2GB test/test:2": {
           "code": 0,
           "stdout": "successfully ran test/test:2 image"
       },
       "docker pull test/test:2": {
           "code": 0,
           "stdout": "successfully pulled test/test:2 image"
       }
    }
};

// Add extra answer definitions that need to be dynamically generated
a.exist[DockerFilePath] = true;

a.exec[`docker build -f ${DockerFilePath} -t test/test:2`] = {
    "code": 0,
    "stdout": "successfully build test/test:2 image"
};
a.exec[`docker build -f ${DockerFilePath} -t test/test:2 -m 2GB`] = {
    "code": 0,
    "stdout": "successfully build test/test:2 image"
};
a.exec[`docker build -f ${DockerFilePath} -t test/Te st:2`] = {
    "code": 1,
    "stdout": "test/Te st:2 not valid imagename"
};
a.exec[`docker build -f ${DockerFilePath} -t test/test:2 -t test/test`] = {
    "code": 0,
    "stdout": "successfully build test/test image with latest tag"
};
a.exec[`docker build -f ${DockerFilePath} -t ajgtestacr1.azurecr.io/test/test:2`] = {
    "code": 0,
    "stdout": "successfully build ajgtestacr1.azurecr.io/test/test image with latest tag"
};
a.exec[`docker build -f ${DockerFilePath} -t ${shared.ImageNamesFileImageName}`] = {
    "code": 0
};
a.exec[`docker tag test/test:2 ajgtestacr1.azurecr.io/test/test:2`] = {
    "code": 0
};
a.exec[`docker tag ${shared.ImageNamesFileImageName} ajgtestacr1.azurecr.io/${shared.ImageNamesFileImageName}:latest`] = {
    "code": 0
};
a.exec[`docker run --rm ${shared.ImageNamesFileImageName}`] = {
    "code": 0
};
a.exec[`docker push ${shared.ImageNamesFileImageName}:latest`] = {
    "code": 0
};
a.exec[`docker build -f ${DockerFilePath} -t test/test:2 -t test/test:6`] = {
    "code": 0,
    "stdout": "successfully build test/test:2 and test/test:6 image"
};
a.exec[`docker build -f ${DockerFilePath} -t test:testtag -t test/test:2`] = {
    "code": 0,
    "stdout": "successfully build test/test:2 and -t test:testtag image"
};
a.exec[`docker push test/test:2 -t testtag:testimage`] = {
    "code": 0
};


tr.setAnswers(<any>a);

// Create mock for fs module
let fs = require('fs');
let fsClone = Object.assign({}, fs);
fsClone.readFileSync = function(filePath, options) {
    switch (filePath) {
        case ImageNamesPath:
            return shared.ImageNamesFileImageName;
        default:
            return fs.readFileSync(filePath, options);
    }
};
tr.registerMock('fs', fsClone);

tr.run();