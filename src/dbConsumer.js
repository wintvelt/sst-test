// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
import sentry from './libs/sentry-lib'


const baseHandler = async (event) => {
    console.log(event.Records[0].eventName)
    console.log(event.Records[0].dynamodb)
    return "OK"
}

export const handler = middy(sentry(baseHandler))
    .use(errorLogger())
