// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
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
