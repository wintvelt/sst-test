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

## Event streams
It is up to the processing (receiving) microservice to
- connect to the SNS topic(s) to consume
- (optionally) setup an SQS queue connected to the SNS topic to consume

# Dependency publication service

## API
API is public, but heavily throttled.

### `GET /?id=[package name]`
Returns all subscribers to [package name] as a list
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

## Pub Topics


## Sub Topics
(none)