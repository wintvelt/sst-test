// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import errorLogger from '@middy/error-logger'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib";

export const makeLatest = (event) => {
    // Get data from event body
    const { ownerName, stage, pack } = event.body;
    const name = ownerName.split('/')[1]

    // pack is already parsed
    const { dependencies } = pack

    let updates = []
    for (const key in dependencies) {
        if (Object.hasOwnProperty.call(dependencies, key)) {
            const version = dependencies[key];
            updates.push({
                packageStage: `${stage}-${name}`,
                dependency: key,
                version,
                createdAt: Date.now()
            })
        }
    }
    return updates
}

const baseHandler = async (event) => {
    const { ownerName, stage, pack } = event.body;
    const name = ownerName.split('/')[1]

    const queryParams = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: '#ps = :ps',
        ExpressionAttributeNames: { '#ps': 'packageStage' },
        ExpressionAttributeValues: { ':ps': `${stage}-${name}` },
    };
    let queryResult
    try {
        queryResult = await dynamo.query(queryParams)
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
    const oldDeps = queryResult.Items || []
    const latestDeps = makeLatest(event)

    const { dependencies } = pack
    const depsToDel = oldDeps
        .filter(({ dependency }) => !Object.hasOwnProperty.call(dependencies, dependency))

    let depsToAdd = []
    let depsToChange = []
    let unchanged = 0
    latestDeps.forEach(item => {
        const inOldDep = oldDeps.filter(it => (it.dependency === item.dependency))
        const existedInOldDeps = inOldDep.length > 0
        if (existedInOldDeps) {
            if (item.version !== inOldDep[0].version) {
                depsToChange.push(item)
            } else {
                unchanged++
            }
        } else {
            depsToAdd.push(item)
        }
    })

    const delUpdates = depsToDel.map(({ packageStage, dependency }) => ({
        TableName: process.env.TABLE_NAME,
        Key: { packageStage, dependency }
    })).map(dynamo.del)

    const updates = latestDeps.map(Item => ({
        TableName: process.env.TABLE_NAME,
        Item
    })).map(dynamo.put)

    try {
        await Promise.all(updates.concat(delUpdates));
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
    const message = `${depsToDel.length} dependencies removed, ${depsToAdd.length} added, ` +
        `${depsToChange.length} updated, ${unchanged} unchanged`
    const response = { result: 'success', message }
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