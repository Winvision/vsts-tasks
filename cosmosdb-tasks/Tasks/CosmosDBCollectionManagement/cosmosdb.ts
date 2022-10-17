import * as db from 'documentdb';
import * as taskLib from 'azure-pipelines-task-lib/task';

export class CosmosDb {
    client: db.DocumentClient;

    constructor(host: string, key: string) {
        let authOptions : db.AuthOptions = {
            masterKey: key
        }
        let connectionPolicy : db.ConnectionPolicy = {
            MediaReadMode:'Buffered',
            MediaRequestTimeout: 5000,
            RequestTimeout: 5000,
            EnableEndpointDiscovery: true,
            PreferredLocations: [],
            RetryOptions: {
                MaxRetryAttemptCount: 5,
                FixedRetryIntervalInMilliseconds: 500,
                MaxWaitTimeInSeconds: 3
            },
            DisableSSLVerification: true
        }

        this.client = new db.DocumentClient(host, authOptions, connectionPolicy);
    }

    CreateCollection(database: string, collection: string, throughput: string, partitionKey: string, ttl: string, indexingPolicy: db.IndexingPolicy) {
        let databaseLink = db.UriFactory.createDatabaseUri(database);

        this.client.readDatabase(databaseLink, (err, d) => {
            if (err) {
                taskLib.warning(`Database ${database} doesn't exist, creating it now`)

                this.client.createDatabase({ id: database}, (err, d) => {
                    if (err){
                        this.handleError(err);
                        return;
                    }

                    taskLib.debug(`Database ${database} created`);
                });
            }

            let collectionLink = db.UriFactory.createDocumentCollectionUri(database, collection);
            this.client.readCollection(collectionLink, (err, c) =>{
                if (c) {
                    taskLib.setResult(taskLib.TaskResult.Failed, `The collection ${collection} in database ${database} allready exist.`);
                    return;
                }

                let offer = (throughput == null || throughput.length === 0) ? 400 : Number(throughput);
                if (offer > 10000 && (partitionKey == null || partitionKey.length === 0)) {
                    offer = 10000;
                }

                let requestOptions : db.RequestOptions = {
                    offerThroughput: offer
                };

                let newCollection : db.Collection = {
                    id: collection
                };

                if (partitionKey) {
                    newCollection.partitionKey = {
                        kind: 'Hash',
                        paths: [partitionKey]
                    }
                }

                if (ttl) {
                    newCollection.defaultTtl = Number(ttl)
                }

                if (indexingPolicy) {
                    newCollection.indexingPolicy = indexingPolicy;
                }

                this.client.createCollection(databaseLink, newCollection, requestOptions, (err) => {
                    if (err){
                        this.handleError(err);
                        return;
                    }

                    taskLib.debug(`Collection ${collection} created`);
                });
            });
        });  
    }

    UpdateCollection(database: string, collection: string, throughput: string, partitionKey: string, ttl: string, indexingPolicy: db.IndexingPolicy, createIfNotExists: boolean) {
        let databaseLink = db.UriFactory.createDatabaseUri(database);

        this.client.readDatabase(databaseLink, (err, d) => {
            if (err) {
                if (createIfNotExists === false) {
                    taskLib.setResult(taskLib.TaskResult.Failed, `Database ${database} doesn't exist.`);
                    return;
                }

                taskLib.warning(`Database ${database} doesn't exist, creating it now`)
                this.client.createDatabase({ id: database}, (err, d) => {
                    if (err){
                        this.handleError(err);
                        return;
                    }

                    taskLib.debug(`Database ${database} created`);
                });
            }

            let collectionLink = db.UriFactory.createDocumentCollectionUri(database, collection);
            this.client.readCollection(collectionLink, (err, c) =>{
                if (err) {
                    if (createIfNotExists === false) {
                        taskLib.setResult(taskLib.TaskResult.Failed, `Collection ${collection} in database ${database} doesn't exist.`);
                        return;
                    }
    
                    this.CreateCollection(database, collection, throughput, partitionKey, ttl, indexingPolicy);
                    return;
                }

                if (indexingPolicy)
                {
                    c.indexingPolicy = indexingPolicy;
                }

                if (ttl)
                {
                    c.defaultTtl = Number(ttl);
                }

                this.client.replaceCollection(collectionLink, c, (err) => {
                    if (err) {
                        this.handleError(err);
                        return;
                    }

                    taskLib.debug(`Collection ${collection} updated`);
                });

                if (throughput)
                {
                    this.client.queryOffers(`SELECT * FROM root r WHERE r.resource='${c._self}'`).toArray((err: db.QueryError, offers) => {
                        if (err) {
                            this.handleError(err);
                            return;
                        }

                        if (offers.length > 0) {
                            let offer = offers[0];
                            offer.content.offerThroughput = Number(throughput);
                            this.client.replaceOffer(offer._self, offer, (err)=>{
                                if (err) {
                                    this.handleError(err);
                                    return;
                                }

                                taskLib.debug(`Collection offer for ${collection} updated`);
                            });
                        }
                    });
                }
            });
        });  
    }

    DeleteCollection(database: string, collection: string) {
        let databaseLink = db.UriFactory.createDatabaseUri(database);

        this.client.readDatabase(databaseLink, (err, d) => {
            if (err) {
                console.log(err);
                taskLib.warning(`Database ${database} doesn't exist.`)
                taskLib.setResult(taskLib.TaskResult.Succeeded, "");
                return;
            }

            let collectionLink = db.UriFactory.createDocumentCollectionUri(database, collection);
            this.client.readCollection(collectionLink, (err, c) =>{
                if (err) {
                    taskLib.warning(`Collection ${collection} in database ${database} doesn't exist.`)
                    taskLib.setResult(taskLib.TaskResult.Succeeded, "");
                    return;
                }

                this.client.deleteCollection(collectionLink, (err)=> {
                    if (err) {
                        this.handleError(err);
                        return
                    }

                    taskLib.setResult(taskLib.TaskResult.Succeeded, `Collection ${collection} in database ${database} deleted.`);
                });
            });
        });      
    }

    private handleError(error: db.QueryError) {
        const message = JSON.parse(error.body).message;
        taskLib.error(`An error with code '${error.code}' has occurred`);

        taskLib.setResult(taskLib.TaskResult.Failed, message);
    }
}