import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers"
import { Duration } from "@aws-cdk/core"
import * as sst from "@serverless-stack/resources"
import { tracingEnvProps, tracingLayerProps } from "./lambda-layers-lib"

export const lambdaAuthorizerProps = (stack, handler, env) => ({
    defaultAuthorizationType: sst.ApiAuthorizationType.CUSTOM,
    defaultAuthorizer: new HttpLambdaAuthorizer({
        authorizerName: "LambdaAuthorizer",
        handler: new sst.Function(stack, "Authorizer", {
            handler,
            environment: {
                SECRET_PUBLISH_TOKEN: env.SECRET_PUBLISH_TOKEN,
                STAGE: env.STAGE,
                SENTRY_DSN: env.SENTRY_DSN,
                ...tracingEnvProps
            },
            ...tracingLayerProps(stack, "authorizer")
        }),
        resultsCacheTtl: Duration.seconds(0) // turn off cache to prevent weird errors
    }),
})
