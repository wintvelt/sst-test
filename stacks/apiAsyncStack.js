import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import { Duration } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";
import { lambdaPermissions } from "../src/libs/permissions-lib";

const routeNames = {
    putAsync: "PUT   /async",
    put: "PUT   /",
}

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    asyncApi;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { api } = props;
        const functionArn = api.getFunction(routeNames.put).functionArn

        // Create the API
        this.asyncApi = new sst.Api(this, "apiAsync", {
            defaultFunctionProps: {
                environment: {
                    FUNCTION_ARN: functionArn,
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
                [routeNames.putAsync]: {
                    function: {
                        handler: "src/createAsync.handler",
                        timeout: 10,
                        bundle: { copyFiles: [{ from: "common", to: "." }] }
                    }
                }
            },
        });

        // add permission to invoke the lambda
        this.asyncApi.attachPermissions(
            lambdaPermissions(api.getFunction(routeNames.put).functionArn)
        )

        const outputs = {
            "asyncurl": this.asyncApi.url + '/async',
            "createasyncarn": this.asyncApi.getFunction(routeNames.putAsync).functionArn,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}