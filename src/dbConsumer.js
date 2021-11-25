// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import sentry from './libs/sentry-lib'


const baseHandler = async (event) => {
    console.log(event)
    return "OK"
}

// export const handler = middy(sentry(baseHandler))
export const handler = middy(sentry(baseHandler))
    .use(errorLogger())
    // .use(httpErrorHandler({ fallbackMessage: 'server error' }))
    // .use(cors())
