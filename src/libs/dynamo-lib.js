import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const dynamo = {
    put: (params) => dynamoDb.put(params).promise()
}