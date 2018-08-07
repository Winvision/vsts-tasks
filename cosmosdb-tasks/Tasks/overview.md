# Create or update Azure Cosmos DB collections and documents as part of your Release

Use VSTS's build/release management to manage your Azure Cosmos DB database collections. Currently the following features are available:
- Delete/Create/Update collections
- Import/Export data to/from Azure Cosmos DB 

This extension installs the following components
- **Cosmos DB Data Migration Tool:** A Build/Release task to run the Data Migration Tool. [Learn more](https://azure.microsoft.com/en-us/updates/documentdb-data-migration-tool/)
- **Cosmos DB Collection Management:** A Build/Release task to create/update your existing collection(s).

**Cosmos DB Data Migration Tool**
![Data Migration Tool task](/cosmosdb-tasks/Tasks/images/cosmosdbdatamigrationtool.png)

**Cosmos DB Data Migration Tool**
![Collection Management task](/cosmosdb-tasks/Tasks/images/cosmosdbcollection.png)

## Release notes
* 1.0.0 - Initial release

## Compatibility

Runs on Windows agents

## Contributing

Feel free to notify any issue in the issues section of the GitHub repository.
