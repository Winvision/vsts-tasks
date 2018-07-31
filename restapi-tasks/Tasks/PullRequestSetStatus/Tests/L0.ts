import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'vsts-task-lib/mock-test';
import tl = require('vsts-task-lib');
import * as shared from './TestShared';

describe('Docker Suite', function() {
    this.timeout(30000);
    before((done) => {
        process.env[shared.TestEnvVars.operatingSystem] = tl.osType().match(/^Win/) ? shared.OperatingSystems.Windows : shared.OperatingSystems.Other;
        done();
    });
    beforeEach(() => {
        delete process.env[shared.TestEnvVars.command];
        delete process.env[shared.TestEnvVars.containerType];
        delete process.env[shared.TestEnvVars.includeLatestTag];
        delete process.env[shared.TestEnvVars.qualifyImageName];
        delete process.env[shared.TestEnvVars.includeLatestTag];
        delete process.env[shared.TestEnvVars.imageName];
        delete process.env[shared.TestEnvVars.enforceDockerNamingConvention];
        delete process.env[shared.TestEnvVars.memoryLimit];
        delete process.env[shared.TestEnvVars.pushMultipleImages];
        delete process.env[shared.TestEnvVars.tagMultipleImages];
        delete process.env[shared.TestEnvVars.arguments];
    });
    after(function () {
    });

    it('Runs successfully for docker build', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build with memory limit', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.memoryLimit] = "2GB";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2 -m 2GB`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build for invalid image name', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.imageName] = 'test/Te st:2';
        process.env[shared.TestEnvVars.enforceDockerNamingConvention] = 'true';
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs fails for docker build for invalid image name and modify image name false', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.imageName] = 'test/Te st:2';
        process.env[shared.TestEnvVars.enforceDockerNamingConvention] = 'false';
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 1 || tr.errorIssues.length, 'should have written to stderror');
        assert(tr.failed, 'task should have failed');
        assert(tr.stdout.indexOf(`test/Te st:2 not valid imagename`) != -1, "docker build should fail");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build for invalid image name and additional image tag', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.imageName] = 'test/Test:2';
        process.env[shared.TestEnvVars.enforceDockerNamingConvention] = 'true';
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });


    it('Runs successfully for docker build with latest tag', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.includeLatestTag] = "true";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2 -t test/test`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build with arguments', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.arguments] = "-t test:testtag";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test:testtag -t test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker run image', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.runImage;
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf("[command]docker run --rm test/test:2") != -1, "docker run should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker run image with memory limit', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.runImage;
        process.env[shared.TestEnvVars.memoryLimit] = "2GB";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf("[command]docker run --rm -m 2GB test/test:2") != -1, "docker run should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker tag image from image names file', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.tagImages;
        process.env[shared.TestEnvVars.containerType] = shared.ContainerTypes.AzureContainerRegistry;
        process.env[shared.TestEnvVars.qualifyImageName] = "true";
        process.env[shared.TestEnvVars.tagMultipleImages] = "true";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker tag ${shared.ImageNamesFileImageName} ajgtestacr1.azurecr.io/${shared.ImageNamesFileImageName}:latest`) != -1, "docker tag should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker tag image', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.tagImages;
        process.env[shared.TestEnvVars.containerType] = shared.ContainerTypes.AzureContainerRegistry;
        process.env[shared.TestEnvVars.qualifyImageName] = "true";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker tag test/test:2 ajgtestacr1.azurecr.io/test/test:2`) != -1, "docker tag should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker push image', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.pushImage;
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf("[command]docker push test/test:2") != -1, "docker push should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker push image with arguments', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.pushImage;
        process.env[shared.TestEnvVars.arguments] = "-t testtag:testimage";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf("[command]docker push test/test:2 -t testtag:testimage") != -1, "docker push should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker push image from image names file', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.pushImage;
        process.env[shared.TestEnvVars.pushMultipleImages] = "true";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker push ${shared.ImageNamesFileImageName}:latest`) != -1, "docker push should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker pull image', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = "pull";
        process.env[shared.TestEnvVars.arguments] = "test/test:2";
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf("[command]docker pull test/test:2") != -1, "docker pull should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build with ACR', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.containerType] = shared.ContainerTypes.AzureContainerRegistry;
        tr.run();

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });

    it('Runs successfully for docker build with ACR and qualify image name', (done:MochaDone) => {
        let tp = path.join(__dirname, 'TestSetup.js');
        let tr : ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        process.env[shared.TestEnvVars.command] = shared.CommandTypes.buildImage;
        process.env[shared.TestEnvVars.containerType] = shared.ContainerTypes.AzureContainerRegistry;
        process.env[shared.TestEnvVars.qualifyImageName] = "true";
        tr.run();
        
        //console.log(tr.stdout);

        assert(tr.invokedToolCount == 1, 'should have invoked tool one times. actual: ' + tr.invokedToolCount);
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
        assert(tr.stdout.indexOf(`[command]docker build -f ${shared.formatPath("dir1/DockerFile")} -t ajgtestacr1.azurecr.io/test/test:2`) != -1, "docker build should run");
        console.log(tr.stderr);
        done();
    });
});