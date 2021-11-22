// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import errorLogger from '@middy/error-logger'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import { inputSchema } from './libs/create-input-schema'
import sentry from './libs/sentry-lib'
import { lambda } from './libs/lambda-lib'

const baseHandler = async (event) => {
    const body = JSON.stringify(event.body)
    const params = {
        FunctionName: process.env.FUNCTION_ARN,
        InvocationType: 'Event',
        Payload: JSON.stringify({ ...event, body })
    }
    const result = await lambda.invoke(params)
}

export const handler = middy(sentry(baseHandler))
    .use(errorLogger())
    .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
    .use(validator({ inputSchema })) // validates the input
    .use(cors())
    .use(httpErrorHandler({ fallbackMessage: 'server error' }))
