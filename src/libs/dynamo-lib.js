// import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"

// AWSXRay.setContextMissingStrategy("LOG_ERROR")

// const AWSWrapped = AWSXRay.captureAWS(AWS)

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const dynamo = {
    put: (params) => dynamoDb.put(params).promise(),
    query: (params) => dynamoDb.query(params).promise(),
    scan: (params) => dynamoDb.scan(params).promise(),
    del: (params) => dynamoDb.delete(params).promise()
}