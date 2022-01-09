import * as sst from "@serverless-stack/resources"
import { lambdaAuthorizerProps } from "../src/libs/lambda-authorizer-lib"
// import { tracingEnvProps, tracingLayerProps } from "../src/libs/lambda-layers-lib"
import * as cdk from "@aws-cdk/core"
import { lambdaPermissions } from "../src/libs/permissions-lib"

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
            ...lambdaAuthorizerProps(this, "src/authorizer.handler", process.env),
            defaultThrottlingRateLimit: 2000,
            defaultThrottlingBurstLimit: 500,
            routes: {
                [routeNames.putAsync]: new sst.Function(this, 'createAsync', {
                    handler: "src/createAsync.handler",
                    environment: {
                        FUNCTION_ARN: functionArn,
                        SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
                        STAGE: process.env.STAGE,
                        SENTRY_DSN: process.env.SENTRY_DSN,
                        AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
                        // ...tracingEnvProps
                    },
                    timeout: 10,
                    // ...tracingLayerProps(this, "put"),
                })
            },
        });

        // add permission to invoke the lambda
        this.asyncApi.attachPermissions(
            lambdaPermissions(api.getFunction(routeNames.put).functionArn)
        )

        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )

        const outputs = {
            "asyncurl": this.asyncApi.url + '/async',
            "createasyncarn": this.asyncApi.getFunction(routeNames.putAsync).functionArn,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}