// handler for PUT route
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import errorLogger from '@middy/error-logger'
import validator from '@middy/validator'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import Sentry from "@sentry/serverless"

import { sqs } from "./libs/sqs-lib"
import { inputSchema } from './libs/create-input-schema'

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN
})


const baseHandler = async (event) => {

    const params = {
        MessageAttributes: {
            "Author": {
                DataType: "String",
                StringValue: "Async API call"
            }
        },
        MessageBody: JSON.stringify(event.body),
        MessageDeduplicationId: new Date().toISOString(),  // Required for FIFO queues
        MessageGroupId: "deps",  // Required for FIFO queues
        QueueUrl: process.env.QUEUE_URL
    };

    try {
        await sqs.sendMessage(params)
    } catch (error) {
        console.error(error.message)
        throw new Error('could not post to queue')
    }

    const message = 'dependency update queued'
    const response = { result: 'success', message }
    return { statusCode: 200, body: JSON.stringify(response) }
}

export const handler = Sentry.AWSLambda.wrapHandler(
    middy(baseHandler)
        .use(errorLogger())
        .use(jsonBodyParser()) // parses the request body when it's a JSON and converts it to an object
        .use(validator({ inputSchema })) // validates the input
        .use(cors())
        .use(httpErrorHandler({ fallbackMessage: 'server error' }))
)