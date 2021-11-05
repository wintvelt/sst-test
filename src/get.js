// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
// import { dynamo } from "./libs/dynamo-lib";


const baseHandler = async (event) => {
    const encodedId = event.pathParameters.id
    const dependency = decodeURIComponent(encodedId)

    const response = { result: 'success', message: `parsed as "${dependency}"` }
    return { statusCode: 200, body: JSON.stringify(response) }
}

export const handler = middy(baseHandler)
    .use(errorLogger())
    .use(httpErrorHandler())
    .use(cors())