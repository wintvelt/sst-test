import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const dynamo = {
    put: (params) => dynamoDb.put(params).promise(),
    query: (params) => dynamoDb.query(params).promise(),
    scan: (params) => dynamoDb.scan(params).promise(),
    del: (params) => dynamoDb.delete(params).promise()
}