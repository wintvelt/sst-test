import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const dynamo = {
    update: (params) => dynamoDb.update(params).promise()
}