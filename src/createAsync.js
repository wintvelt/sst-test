// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { inputSchema } from './libs/create-input-schema'
import { lambda } from './libs/lambda-lib'

const baseHandler = async (event) => {
    const body = JSON.stringify(event.body)
    const params = {
        FunctionName: process.env.FUNCTION_ARN,
        InvocationType: 'Event',
        Payload: JSON.stringify({ ...event, body })
    }
    await lambda.invoke(params)
}

const handler = middy(baseHandler)
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(cors())
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))

// module exports to make Open Telemetry work for logz.io
module.exports = { handler }