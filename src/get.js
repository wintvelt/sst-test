// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib";


const baseHandler = async (event) => {
    const id = event.queryStringParameters.id // decoding already done

    const queryParams = {
        TableName: process.env.TABLE_NAME,
        IndexName: "dependencyIndex",
        KeyConditionExpression: "dependency = :dep",
        ExpressionAttributeValues: {
            ":dep": id
        },
    };

    let result
    try {
        result = await dynamo.query(queryParams)
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }

    return { statusCode: 200, body: JSON.stringify(result.Items) }
}

export const handler = middy(baseHandler)
    .use(errorLogger())
    .use(httpErrorHandler())
    .use(cors())