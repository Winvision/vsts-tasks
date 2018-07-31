import tl = require('vsts-task-lib');

export let TestEnvVars = {
    operatingSystem: "__operating_system__",
    command: "__command__",
    containerType: "__container_type__",
    qualifyImageName: "__qualifyImageName__",
    includeLatestTag: "__includeLatestTag__",
    imageName: "__imageName__",
    enforceDockerNamingConvention: "__enforceDockerNamingConvention__",
    memoryLimit: "__memoryLimit__",
    pushMultipleImages: "__pushMultipleImages__",
    tagMultipleImages: "__tagMultipleImages__",
    arguments: "__arguments__"
};

export let OperatingSystems = {
    Windows: "Windows",
    Other: "Other"
};

export let CommandTypes = {
    buildImage: "Build an image",
    tagImages: "Tag image",
    pushImage: "Push an image",
    runImage: "Run an image"
};

export let ContainerTypes = {
    AzureContainerRegistry: "Azure Container Registry",
    ContainerRegistry: "Container Registry"
}

export let ImageNamesFileImageName = "test_image";

/**
 * Formats the given path to be appropriate for the operating system.
 * @param canonicalPath A non-rooted path using a forward slash (/) as a directory separator.
 */
export function formatPath(canonicalPath: string) {
    if (process.env[TestEnvVars.operatingSystem] === OperatingSystems.Windows) {
        return "F:\\" + canonicalPath.replace('/', '\\');
    } else {
        return "/" + canonicalPath;
    }
};