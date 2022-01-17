// import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"
import { apiCall } from "./promise-lib";

// AWSXRay.setContextMissingStrategy("LOG_ERROR")

// const AWSWrapped = AWSXRay.captureAWS(AWS)

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const dynamo = {
    put: (params) => apiCall(dynamoDb.put(params).promise()),
    query: (params) => apiCall(dynamoDb.query(params).promise()),
    scan: (params) => apiCall(dynamoDb.scan(params).promise()),
    del: (params) => apiCall(dynamoDb.delete(params).promise())
}