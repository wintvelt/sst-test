// handler for GET route
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib"

const getById = async (id) => {
    const queryParams = {
        TableName: process.env.TABLE_NAME,
        IndexName: "dependencyIndex",
        KeyConditionExpression: "dependency = :dep",
        ExpressionAttributeValues: {
            ":dep": id
        },
    };

    const [err, result] = await dynamo.query(queryParams)
    if (err) throw new Error(err.message)

    return result.Items
}

const getAll = async () => {
    const params = {
        TableName: process.env.TABLE,
        ProjectionExpression: "packageStage",
    };

    const [err, result] = await dynamo.scan(params)
    if (err) throw new Error(err.message)

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

const handler = middy(baseHandler)
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))
    .use(cors())

// module exports to make Open Telemetry work for logz.io
module.exports = { handler }