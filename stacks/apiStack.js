import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import { Duration } from "@aws-cdk/core";
import { LayerVersion } from "@aws-cdk/aws-lambda";
import * as sst from "@serverless-stack/resources";

// arn captured from https://docs.sentry.io/platforms/node/guides/aws-lambda/layer/
const SENTRY_DSN = 'arn:aws:lambda:eu-central-1:943013980633:layer:SentryNodeServerlessSDK:38'

const routeNames = {
    get: "GET   /",
    put: "PUT   /",
    putAsync: "PUT   /async"
}

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope, id, props) {
        super(scope, id, props);

        const sentry = LayerVersion.fromLayerVersionArn(
            this,
            "SentryLayer",
            SENTRY_DSN
        );

        const { table, queue } = props;

        // Create the API
        this.api = new sst.Api(this, "Api", {
            defaultFunctionProps: {
                environment: {
                    TABLE_NAME: table.tableName,
                    QUEUE_URL: queue.sqsQueue.queueUrl,
                    SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
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
                    },
                }),
                resultsCacheTtl: Duration.seconds(0) // turn off cache to prevent weird errors
            }),
            defaultThrottlingRateLimit: 2000,
            defaultThrottlingBurstLimit: 500,
            routes: {
                [routeNames.put]: "src/create.handler",
                [routeNames.putAsync]: "src/createAsync.handler",
                [routeNames.get]: "src/get.handler"
            },
        });

        this.api.attachPermissions([table]);
        this.api.attachPermissionsToRoute(routeNames.putAsync, [queue])

        if (!scope.local) {
            stack.addDefaultFunctionLayers([sentry]);
            stack.addDefaultFunctionEnv({
                SENTRY_DSN,
                NODE_OPTIONS: "-r @sentry/serverless/dist/awslambda-auto"
            });
        }

        const outputs = {
            "url": this.api.url,
            "asyncurl": this.api.url,
            "createarn": this.api.getFunction(routeNames.put).functionArn,
            "createAsyncarn": this.api.getFunction(routeNames.putAsync).functionArn
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}