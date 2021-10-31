import AWS from "aws-sdk";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function main(event) {
    // Get package.json from event body
    let data;
    try {
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message }),
        };
    }
    const name = data.name;
    const stage = data.stage;
    const pack = data.package;

    const params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            packageStage: `${stage}-${name}`,
            dependency: pack,
            createdAt: Date.now(),
        },
    };

    try {
        await dynamoDb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(params.Item),
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message }),
        };
    }
}