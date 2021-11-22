import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import { Duration } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";

const routeNames = {
    putAsync: "PUT   /async",
}

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    asyncApi;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { apiFunctionArn } = props;

        // Create the API
        this.asyncApi = new sst.Api(this, "Api", {
            defaultFunctionProps: {
                environment: {
                    FUNCTION_ARN: apiFunctionArn,
                    SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
                    STAGE: process.env.STAGE,
                    SENTRY_DSN: process.env.SENTRY_DSN,
                    AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
                },
            },
            defaultAuthorizationType: sst.ApiAuthorizationType.CUSTOM,
            defaultAuthorizer: new HttpLambdaAuthorizer({
                authorizerName: "LambdaAuthorizer",
                handler: new sst.Function(this, "Authorizer", {
                    handler: "src/authorizer.handler",
                    environment: {
                        SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
                        STAGE: process.env.STAGE,
                        SENTRY_DSN: process.env.SENTRY_DSN,
                        },
                }),
                resultsCacheTtl: Duration.seconds(0) // turn off cache to prevent weird errors
            }),
            defaultThrottlingRateLimit: 2000,
            defaultThrottlingBurstLimit: 500,
            routes: {
                [routeNames.putAsync]: "src/createAsync.handler",
            },
        });

        const outputs = {
            "asyncurl": this.asyncApi.url+'/async',
            "createasyncarn": this.asyncApi.getFunction(routeNames.putAsync).functionArn,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}