// test validator
import middy from '@middy/core'
import validator from '@middy/validator'
import errorLogger from '@middy/error-logger'
import httpErrorHandler from '@middy/http-error-handler'
import sqsJsonBodyParser from '@middy/sqs-json-body-parser'

import { handler as eventHandler } from './create'
import { inputSchema as recordInputSchema } from './libs/create-input-schema'

const baseHandler = async (event) => {
    // extract records from event
    const records = event.Records

    let results = []
    // create processing promise for each
    const recordsProcesses = records.map(eventHandler)
    // run all promises
    try {
        results = await Promise.all(recordsProcesses)
        if (results.filter(res => (res.statusCode > 299)).length > 0) {
            throw new Error('at least 1 package publication failed')
        }
    } catch (error) {
        console.error(error.message)
        throw new Error(error.message)
    }
    // return packages published
    const response = records.length;
    return { statusCode: 200, body: JSON.stringify(`${response} package publications processed`) }
}

const inputSchema = {
    type: "object",
    properties: {
        Records: {
            type: "array",
            items: recordInputSchema
        }
    }
}

export const handler = middy(baseHandler)
    .use(errorLogger())
    .use(sqsJsonBodyParser())
    .use(validator({ inputSchema })) // validates the input
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))
