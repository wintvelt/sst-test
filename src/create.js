// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import errorLogger from '@middy/error-logger'
import validator from '@middy/validator'
import cors from '@middy/http-cors'
import { dynamo } from "./libs/dynamo-lib";

const baseHandler = async (event) => {
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

    // ASSUME pack is already parsed
    // const  { dependencies } = pack
    let dependencies = {}
    try {
        dependencies = { ...pack.dependencies }
    } catch (error) {
        console.error('pack is not an object yet')
        throw new Error('pack is not an object yet')
    }

    let updates = []
    for (const key in dependencies) {
        if (Object.hasOwnProperty.call(dependencies, key)) {
            const version = dependencies[key];
            updates.push(dynamo.put(putParams(key, version)))
        }
    }
    try {
        await Promise.all(updates);
    } catch (error) {
        console.error(error.message);
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
                ownerName: { type: 'string', pattern: '.+\/{1}.+' }, // string with 1 slash
                stage: { type: 'string', enum: ['prod', 'dev'] },
                pack: { type: 'object' },
                authToken: { type: 'string', const: `Basic ${process.env.SECRET_PUBLISH_TOKEN}` }
            },
            required: ['ownerName', 'stage', 'pack', 'authToken']
        }
    }
}

const handler = middy(baseHandler)
    .use(errorLogger())
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(cors())

module.exports = { handler }