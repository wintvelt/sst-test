# Serverless microservice setup

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack).
Quite heavily adapted though, for personal microservice setup on AWS.

The general idea is that a microservice
- exposes an API (AWS API Gateway and Lambda) on various routes
- may have Lambda functions that subscribe to some SNS topics or SQS queues connected to topics
- has exclusive access to some database (AWS DynamoDB)
- may optionally publish a public npm package with a client SDK, that other microservices can install to access the microservice
    - using the client is mandatory. Because the client is a dependency, the published dependency tree will always reflect consumers/users of the service
- includes a github action workflow, that runs tests and deploys (only if on branch master or dev)
- the workflow also calls a public API, to publish all dependencies

This template contains the service for posting (and retrieving) microservice dependencies. Inner workings described at the end of this doc.

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
- Copies of some private functions may be exposed in npm package too. The consuming service needs to have sufficient authorization to access the infrastructure (database, queues etc) from these clients.
    - advantage is that services on the same (AWS) infrastructure can access each other within the infrastructure - calling `AWS.lambda.invoke()`, without the detour through public access
    - normal use case would be synchronous calls, where the consumer cares about the response from the lambda function
- Even if consuming services only call public API Endpoints - typical for front-end services, it is still recommended to use the public npm client for this. This ensures proper registration of dependencies.

## Folder structure
```
├───.github/
│   └───workflows/
│       └───myfirstaction.yml
├───assets/
│   └───microservice-structure.png
├───npm/
│   ├───index.js
│   └───package.json
├───src/
│   ├───libs/
│   │   └───dynamo-lib.js
│   ├───create.js
│   ├───get.js
│   └───queueConsumer.js
├───stacks/
│   ├───DbStack.js
│   ├───apiStack.js
│   ├───index.js
│   └───queueStack.js
├───test/
│   ├───apiStack.test.js
│   └───create.test.js
├───.gitignore
├───README.md
├───package-lock.json
├───package.json
└───sst.json
```
Notes to this structure
- `.github/workflows/myfirstaction.yml` contains (github) CI/CD workflow for deploying to dev or prod, and to publish any npm package on client side (if the npm folder exists and if the pushed branch is master)
- `npm/` contains the client package to published
- `src/` service core code/ business logic
- `stacks/` infrastructure-as-code setup of the AWS architecture of the service - will be deployed by CI/CD action workflow only if branch is master (to prod) or dev (to dev)


# Dependency publication service

## API
API is public, but heavily throttled. `PUT` API does require a secret token to be included in request body.

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
```json
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

## Published queues for external commands


## Subscription to external event topics
(none)