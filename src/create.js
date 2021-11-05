// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import errorLogger from '@middy/error-logger'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib";

export const makeUpdates = (event) => {
    // Get data from event body
    const { ownerName, stage, pack } = event.body;
    const name = ownerName.split('/')[1]
    const putParams = (dependency, version) => {
        return {
            TableName: process.env.TABLE_NAME,
            Item: {
                packageStage: `${stage}-${name}`,
                dependency,
                version,
                createdAt: Date.now()
            }
        }
    }

    // pack is already parsed
    const { dependencies } = pack

    let updates = []
    for (const key in dependencies) {
        if (Object.hasOwnProperty.call(dependencies, key)) {
            const version = dependencies[key];
            updates.push(putParams(key, version))
        }
    }
    return updates
}

const deleteParams = ({ packageStage, dependency }) => ({
    TableName: process.env.TABLE_NAME,
    Key: {
        packageStage,
        dependency
    }
})

export const makeDeletes = (pack, oldDeps) => {
    const { dependencies } = pack
    return oldDeps
        .filter(({ dependency }) => !Object.hasOwnProperty.call(dependencies, dependency))
        .map(deleteParams)
}

const baseHandler = async (event) => {
    const updateParams = makeUpdates(event)
    console.log(updateParams)
    const updates = updateParams.map(dynamo.put)

    const { ownerName, stage, pack } = event.body;
    const name = ownerName.split('/')[1]

    const queryParams = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: '#ps = :ps',
        ExpressionAttributeNames: { '#ps': 'packageStage' },
        ExpressionAttributeValues: { ':ps': `${stage}-${name}` },
    };
    const queryResult = await dynamo.query(queryParams)
    const oldDeps = queryResult.Items || []

    console.log(oldDeps)
    console.log(makeDeletes(pack, oldDeps))
    const delUpdates = makeDeletes(pack, oldDeps).map(dynamo.del)

    try {
        await Promise.all(updates.concat(delUpdates));
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }

    const response = { result: 'success', message: `${updates.length} dependencies published` }
    return { statusCode: 200, body: JSON.stringify(response) }
}

const inputSchema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                ownerName: { type: 'string', pattern: '.+/{1}.+' }, // string with 1 slash
                stage: { type: 'string', enum: ['prod', 'dev'] },
                pack: { type: 'object' },
                authToken: { type: 'string', const: `Basic ${process.env.SECRET_PUBLISH_TOKEN}` }
            },
            required: ['ownerName', 'stage', 'pack', 'authToken']
        }
    }
}

export const handler = middy(baseHandler)
    .use(errorLogger())
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(httpErrorHandler())
    .use(cors())