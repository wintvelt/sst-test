# Serverless microservice setup

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack).
Quite heavily adapted though, for personal microservice setup on AWS with github actions CI/CD.

The general idea is that a microservice
- exposes an API (AWS API Gateway and Lambda) on various routes
- may have Lambda functions that subscribe to some SNS topics or SQS queues connected to topics
- has exclusive access to some database (AWS DynamoDB)
- may optionally publish a public npm package with a client SDK, that other microservices can install to access the microservice
    - using the client is mandatory. Because the client is a dependency, the published dependency tree will always reflect consumers/users of the service
- includes a github action workflow, that runs tests and deploys (only if on branch master or dev)
- the workflow also calls a public API, to publish all dependencies

This template contains all the basics, and an example service, for posting (and retrieving) microservice dependencies. Inner workings described at the [end of this doc](#dependency-publication-service).

## APIs and Event streams
The microservice is responsible for the following
- Expose APIs to read/ write to database, and to post commands to the SQS queue, for async processing.
    - async queue APIs should have route format like `/normal/route/async/`
- Setup SNS topic to publish internal events, for other services to subscribe to
- Setup SQS queue for other services to post commands to, and setup function to consume commands
- Publish a client that allows other services to connect (to dev and prod versions)
    - to subscribe to the published SNS topic - includes name/ endpoint
    - to post commands to SQS queue - includes queue name/endpoint and input validation

It is up to the processing (receiving) microservice to
- connect to external SNS topic(s) to consume events
- (optionally) setup an SQS queue connected to the SNS topic to consume events

## Service structure
Service structure is typically as follows
![microservice structure](/assets/microservice-structure.png)
Notes
- Only 1 version of npm package is available, published from master branch. Stage (dev or prod) can be passed as a parameter to most functions exposed in package.
- Some private functions may be exposed in npm package too. The consuming service needs to have sufficient authorization to access the infrastructure (database, queues etc) from these clients.
    - advantage is that services on the same (AWS) infrastructure can access each other within the infrastructure - calling `AWS.lambda.invoke()`, without the detour through public access
    - normal use case would be synchronous calls, where the consumer cares about the response from the lambda function
- Even if consuming services only call public API Endpoints - typical for front-end services, it is still recommended to use the public npm client for this. This ensures proper registration of dependencies.

## Folder structure
```
├───.github/
│   └───workflows/
│       └───myfirstaction.yml
├───npm/
│   ├───api.js
│   ├───arns.js
│   ├───functions.js
│   ├───index.js
│   └───package.json
├───src/
│   ├───libs/
│   │   └───dynamo-lib.js
│   ├───create.js
│   ├───get.js
│   └───queueConsumer.js
├───stacks/
│   ├───apiStack.js
│   └───index.js
├───test/
│   ├───apiStack.test.js
│   └───create.test.js
├───.gitignore
├───package.json
└───sst.json
```
Notes to this structure
- `.github/workflows/myfirstaction.yml` contains (github) CI/CD workflow for deploying to dev or prod, and to publish any npm package on client side (if the npm folder exists and if the pushed branch is master)
- `npm/` contains the client package to published
- `src/` service core code/ business logic
- `stacks/` infrastructure-as-code setup of the AWS architecture of the service - will be deployed by CI/CD action workflow only if branch is master (to prod) or dev (to dev)

## Naming conventions
- Service name (`name` in root `package.json`) should be of format `[project]-[service]`
    - sst serverless will automatically prepend `[stage]-` before the service name upon deployment in infra stack - for API Gateway, Lambda functions, Dynamo tables, Queues, Cloudwatch etc)
    - for Lambda functions, sst serverless will append `[method]` after function name
- Stack names (inside sst stack code) ideally have simple names, like `table` (for DynamoDb) or `queue` (for SQS). Api should end in `-api` to ensure output is published to parameter store (for client to retrieve)
    - no need to duplicate the service name. And in deployment, service name will be added anyway.
    - this also makes referencing in the code easier
    - for multiple same-type stacks, prepend with a short qualifier, in with dashes. E.g. `simple-topic` and `versioned-topic`
- Client package name (to be published on npm) should be of format `@owner/[project]-[service]-client`
    - set in `package.json` in /npm folder

## Environment variables
Github repo needs to have the following secrets - they are accessed and used by the github workflow (in `.github/workflows`)
- `AWS_ACCESS_KEY_ID` to allow deployment to AWS and set permission to access other services
- `AWS_SECRET_ACCESS_KEY`
- `SECRET_PUBLISH_TOKEN`: Basic token used to publish dependencies to a common shared service
- `NPM_TOKEN`: Token to allow publication of client npm package to npm registry

*THIS SHOULD BE UPDATED*
In the `.github/workflows` yml doc, the following env var for publishing dependencies
- this one you can delete: `DEV_PUBLISH_ENDPOINT`: hardcoded url of API endpoint to publish dependencies - only used for the dependency-service
- should stay in: `PROD_PUBLISH_ENDPOINT`: url for dependencies when on master branch (= prod stage)
Your service will always publish to the prod endpoint. Also when on dev branch.
- you should also change the other dev_publish references to prod_publish

Other environment variables in backend functions can only be set in stack definition. E.g. the dynamoDb tablename needs to be set in API Gateway for the handler function to access `process.env.TABLE_NAME`. And all stack entities (tables, queues, etc) should be set as environment variables, because the name depend on the stage (dev or prod).

## Service client setup
Client packages are published to npm with public access. They expose:

`api.js` file, which exports a default object, containing endpoint urls, structured as follows
- properties for each endpoint, named in camelCase in the format `[method][route]`, e.g. `putAsync`

`arns.js` file, exposing lambda arns in the same way. For setting permissions. Typically for sns topics to publish to.  
`functions.js`, which exposes `invoke[FunctionName]` style functions for lambda invocation.
- All functions in client will expect `process.env.STAGE` to be set (to either prod or dev)

so they can be used like this
```javascript
// consumer.js
import apiUrls from '@wintvelt/spqr-albums-client/api'
import { invokePut } from '@wintvelt/spqr-albums-client/functions'

const url = apiUrls.getAlbumsId[process.env.STAGE]

let fetchResult
try {
    fetchResult = await axios(url+'/albumId1234')
} catch (error) {
    ///
}

let invokeResult
try {
    invokeResult = await invokePut(myEvent)
} catch (error) {
    ///
}
```


client package content example:

```javascript
// apiEndpoints.js
export default {
    getAlbumsId: {
        dev: 'https://aws/route/to/some/endpoint',
        prod: 'https://aws/route/to/some/other/endpoint',
    }
}

```

---
# Dependency publication service
*on cloning this repo, replace with specifics for your service*

## Client
Per standard, all functions in client will expect `process.env.STAGE` to be set (to either prod or dev)
Additionally, client functions need
- `process.env.SECRET_PUBLISH_TOKEN` to be set, to allow publishing dependencies.

Functions can be imported like this
```javascript
import { invoke, invokeAsync } from '@wintvelt/sst-test-client'
```

`invoke(event)` will directly publish the dependencies, allowing to read the changes applied.

`invokeAsync(event)` will asynchronously publish the dependencies, by adding to a queue (internal) for processing async.

The input schema for the event (to be passed as parameter) to both functions is
```javascript
{
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                ownerName: { type: 'string', pattern: '.+/{1}.+' }, // string with 1 slash
                stage: { type: 'string', enum: ['prod', 'dev'] },
                pack: { type: 'object' },
            },
            required: ['ownerName', 'stage', 'pack']
        }
    }
}
```

## API
All API enpoints require `Authorization` header to be included in format `Basic (secret-token)`

In addition, endpoints are heavily throttled. But should not cause problems, because expected invocation frequency is low per account/ project: only on each push/ deploy.

### `GET /`
Returns list of all [stage-packages] in database who published dependencies. Can be useful to collect the complete contents of the database, by using these ids to perform individual get requests for each.
```json
[ "[stage]-[package name]" ]
```

### `GET /?id=[package name]`
Returns all subscribers to `[package name]` as a list
```json
[
    { 
        "packageStage": "[stage]-[subscriber package]",
        "dependency": "[package name from request]",
        "createdAt": 1636151395685,
        "version": "^1.126.0"
    }
]
```
### `PUT /`
Updates dependencies from a `package.json` file.
Request body must be
```javascript
{ 
    "ownerName": "[owner]/[package name]",
    "stage": "dev|prod", // other values not allowed, will return error
    "pack": {}, // object with package.json contents
    "authToken": "Basic [TOKEN]" // Basic authorization token
}
```
Authorization token is a basic secret. Created and distributed by the owner who deploys this service.

Response includes
```javascript
data: {
    result: 'success',
    message: '1 dependencies removed, 1 added, 1 updated, 1 unchanged'
}
```

## Published event topics
(none yet)

## Published queues for external commands
(only exposed via async API endpoint and async function)

## Subscription to external event topics
(none)