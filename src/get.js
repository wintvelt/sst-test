// handler for GET route
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib"
import sentry from './libs/sentry-lib'

const getById = async (id) => {
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
        throw new Error(error.message);
    }
    return result.Items
}

const getAll = async () => {
    const params = {
        TableName: process.env.TABLE_NAME,
        ProjectionExpression: "packageStage",
    };

    let result
    try {
        result = await dynamo.scan(params)
    } catch (error) {
        throw new Error(error.message);
    }
    return [...new Set(result.Items.map(it => it.packageStage))]
}

const baseHandler = async (event) => {
    const id = event.queryStringParameters?.id // decoding already done

    let result
    try {
        if (id) {
            result = await getById(id)
        } else {
            result = await getAll()
        }
    } catch (error) {
        throw new Error(error.message);
    }

    return { statusCode: 200, body: JSON.stringify(result) }
}

// export const handler = middy(sentry(baseHandler))
export const handler = middy(sentry(baseHandler))
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))
    .use(cors())
