# Serverless microservice setup

This project was bootstrapped with [Create Serverless Stack](https://docs.serverless-stack.com/packages/create-serverless-stack).
Quite heavily adapted though, for personal microservice setup on AWS with github actions CI/CD.

An example is explained in [separate readme doc here](assets/DependencyPubReadMe.md)

## How to use
Steps to get going:
1. Setup a new local repo with a clone of this template
    - create a new folder on your machine
    - open terminal in that folder
    - clone this repo: `git clone https://github.com/wintvelt/sst-test.git .`
    - remove the `.git` folder
    - `git init`
2. Set the name of your own package
    - open `package.json` and change the name of your service, and version number
    - also change the name in `sst.json`
3. Initial commit (locally) , via vscode direct, or
    - `git add .`
    - `git commit -m "Initial commit"`
4. Create the remote origin - via vscode direct, or
    - on github site, create a new repo
    - locally: `git remote add origin [your new github repo url]`
    - `git push -u --force origin master`
    - best to create a public repo, if you want free use of GitKraken to view branche structure
    - vscode publishing will not trigger workflow, subsequent commits will. Their test runs will fail until secrets are set
5. Set the secrets
    - following secrets need to be set in github repo
        - `AWS_ACCESS_KEY_ID` to allow deployment to AWS and set permission to access other services
        - `AWS_SECRET_ACCESS_KEY`
        - `SECRET_PUBLISH_TOKEN`: Basic token used to publish dependencies to a common shared service
        - `NPM_TOKEN`: Token to allow publication of client npm package to npm registry
    - local `.env` file will need (for local testing)
        - `SECRET_PUBLISH_TOKEN`
        - `STAGE=dev`
6. Customize setup to pass initial test rounds
    - rename `npm` folder, to prevent publish to npm
    - build initial AWS stack
        - modify 1 of the stack files in `stacks/` folder
        - modify `index.js` in this folder
    - rework tests
    - commit again and sync to remote

## Why this template?
The general idea is that a microservice
- exposes an API (AWS API Gateway and Lambda) on various routes
- may have Lambda functions that subscribe to other SNS topics or creates internal SQS queues connected to topics
- may publish 1 or more (SNS) topics, for other services to subscribe to
- has exclusive access to some database (AWS DynamoDB)
- may publish a public npm package with a client SDK, that other microservices can install to access the microservice
    - for exposing access to other services, using the client is mandatory. Because the client is a dependency, the published dependency tree will always reflect consumers/users of the service
- includes a github action workflow, that runs tests and deploys (only if on branch master or dev)
- the workflow also calls a public API, to publish all dependencies

This template contains all the basics, and an example service, for posting (and retrieving) microservice dependencies. Inner workings described [in another readme doc](assets/DepenencyPubReadMe.md).

## APIs and Event streams
The microservice is responsible for:
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
│   ├───post-deploy/
│   ├───post-deploy-with-updates/
│   └───pre-deploy/
├───.gitignore
├───package.json
└───sst.json
```
Notes to this structure
- `.github/workflows/myfirstaction.yml` contains (github) CI/CD workflow for deploying to dev or prod, and to publish any npm package on client side (if the npm folder exists)
- `npm/` contains the client package to published
- `src/` service core code/ business logic
- `stacks/` infrastructure-as-code setup of the AWS architecture of the service - will be deployed by CI/CD action workflow only if branch is master (to prod) or dev (to dev)
- `test/` contains all tests (duh). Naming is relevant for CI/CD workflow [see below](##tests)

## Naming conventions
- Service name (`name` in root `package.json`) should be of format `[project]-[service]`
    - sst serverless will automatically prepend `[stage]-` before the service name upon deployment in infra stack - for API Gateway, Lambda functions, Dynamo tables, Queues, Cloudwatch etc)
    - for Lambda functions, sst serverless will append `[method]` after function name
- Stack names (inside sst stack code) ideally have simple names, like `table` (for DynamoDb) or `queue` (for SQS), `api` (for API gateway and lambda functions)
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
- `SENTRY_DSN`: Token to connect to sentry for observability (not really secret, but consistent in setup)

*THIS SHOULD BE UPDATED*
In the `.github/workflows` yml doc, the following env var for publishing dependencies
- this one you can delete: `DEV_PUBLISH_ENDPOINT`: hardcoded url of API endpoint to publish dependencies - only used for the dependency-service
- should stay in: `PROD_PUBLISH_ENDPOINT`: url for dependencies when on master branch (= prod stage)
Your service will always publish to the prod endpoint. Also when on dev branch.
- you should also change the other dev_publish references to prod_publish

Other environment variables in backend functions can only be set in stack definition. E.g. the dynamoDb tablename needs to be set in API Gateway for the handler function to access `process.env.TABLE_NAME`. And all stack entities (tables, queues, etc) should be set as environment variables, because the name depends on the stage (dev or prod).

## Service client setup
Client packages are published to npm with public access. They expose:

`apiEndpoints.js` file, which exports a default object, containing endpoint urls, structured as follows
- properties for each endpoint, named in camelCase in the format `[method][route]`, e.g. `putAsync`

`arns.js` file, exposing lambda arns in the same way. For setting permissions. Typically for sns topics to publish to.  
`functions.js`, which exposes `invoke[FunctionName]` style functions for lambda invocation.
- All functions in client will expect `process.env.STAGE` to be set (to either prod or dev). This env variable is set inside the CI/CD deployment flow, but you will need to set it in the function environment variables - typically api stack - as `STAGE: process.env.STAGE`

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

## Tests
The `test` directory contains tests. For CI/CD it has the following structure:
- `pre-deploy`: these tests will run before deployment. They should not access any deployed infra. So e.g. business logic only. If any test fails, the updates will not be deployed.
- `post-deploy`: these are tests that access the deployed infrastructure, for reading. These will run only after the new stack has been deployed, either to dev or prod stage.
- `post-deploy-with-updates`: tests that perform updates on the deployed stack. These will only run when deployment is to dev. Any tests in this folder should have logic to skip the test if the stage=prod

In CI/CD, Post-deployment tests run after deployment and after publishing, so if any of them fail
- the dependencies will still be published
- but any changes to the npm package will not be published to npm
- and any updates to stack output variables will not be pushed to the repo

If you run tests locally with `npx sst test`, all tests will be run.