// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib"
import { inputSchema } from './libs/create-input-schema'

const makeLatest = (event) => {
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

const splitNewChanged = (oldDeps, latestDeps) => {
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
        TableName: process.env.TABLE,
        KeyConditionExpression: '#ps = :ps',
        ExpressionAttributeNames: { '#ps': 'packageStage' },
        ExpressionAttributeValues: { ':ps': `${stage}-${name}` },
    };
    const [err, queryResult] = await dynamo.query(queryParams)
    if (err) {
        console.error(err)
        throw new Error('something went wrong')
    }

    const oldDeps = queryResult.Items || []
    const latestDeps = makeLatest(event)

    const { dependencies } = pack
    const depsToDel = oldDeps
        .filter(({ dependency }) => !Object.hasOwnProperty.call(dependencies, dependency))

    const { depsToAdd, depsToChange, unchanged } = splitNewChanged(oldDeps, latestDeps)

    const delUpdates = depsToDel.map(({ packageStage, dependency }) => ({
        TableName: process.env.TABLE,
        Key: { packageStage, dependency }
    })).map(dynamo.del)

    const updates = [...depsToAdd, ...depsToChange].map(Item => ({
        TableName: process.env.TABLE,
        Item
    })).map(dynamo.put)

    const results = await Promise.all(updates.concat(delUpdates))
    const errorFound = results.find(tuple => tuple[0])
    if (errorFound) throw new Error(errorFound)

    const message = `${depsToDel.length} dependencies removed, ${depsToAdd.length} added, ` +
        `${depsToChange.length} updated, ${unchanged} unchanged`
    return { statusCode: 200, message }
}

const handler = middy(baseHandler)
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(cors())
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))

// module exports to make Open Telemetry work for logz.io
module.exports = { handler, makeLatest, splitNewChanged }