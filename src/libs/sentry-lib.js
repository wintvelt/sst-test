// to report internal (500) errors
import Sentry from "@sentry/serverless"

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.STAGE
});

export default (baseHandler) => Sentry.AWSLambda.wrapHandler(baseHandler)
