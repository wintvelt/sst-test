// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib"
import { inputSchema } from './libs/create-input-schema'
import sentry from './libs/sentry-lib'

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
                createdAt: new Date().toISOString()
            })
        }
    }
    return updates
}

export const splitNewChanged = (oldDeps, latestDeps) => {
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
    return { depsToAdd, depsToChange, unchanged }
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
        throw new Error(error.message);
    }
    const oldDeps = queryResult.Items || []
    const latestDeps = makeLatest(event)

    const { dependencies } = pack
    const depsToDel = oldDeps
        .filter(({ dependency }) => !Object.hasOwnProperty.call(dependencies, dependency))

    const { depsToAdd, depsToChange, unchanged } = splitNewChanged(oldDeps, latestDeps)

    const delUpdates = depsToDel.map(({ packageStage, dependency }) => ({
        TableName: process.env.TABLE_NAME,
        Key: { packageStage, dependency }
    })).map(dynamo.del)

    const updates = [...depsToAdd, ...depsToChange].map(Item => ({
        TableName: process.env.TABLE_NAME,
        Item
    })).map(dynamo.put)
    try {
        await Promise.all(updates.concat(delUpdates));
    } catch (error) {
        throw new Error(error.message);
    }
    const message = `${depsToDel.length} dependencies removed, ${depsToAdd.length} added, ` +
        `${depsToChange.length} updated, ${unchanged} unchanged`
    const response = { result: 'success', message }
    return { statusCode: 200, body: JSON.stringify(response) }
}

const handler = middy(sentry(baseHandler))
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(cors())
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))

module.exports = { handler } // module exports to make Open Telemetry work