import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import { Duration } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";

const routeNames = {
    get: "GET   /",
    put: "PUT   /",
}

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { table, dlq } = props;

        // Create the API
        this.api = new sst.Api(this, "api", {
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
                [routeNames.get]: new sst.Function(this, "getHandler", {
                    handler: "src/get.handler",
                    environment: {
                        TABLE_NAME: table.tableName,
                        SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
                        STAGE: process.env.STAGE,
                        SENTRY_DSN: process.env.SENTRY_DSN,
                        AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
                    },    
                }),
                [routeNames.put]: new sst.Function(this, "putHandler", {
                    handler: "src/create.handler",
                    deadLetterQueue: dlq.sqsQueue,
                    environment: {
                        TABLE_NAME: table.tableName,
                        SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
                        STAGE: process.env.STAGE,
                        SENTRY_DSN: process.env.SENTRY_DSN,
                        AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
                    },    
                }),
            },
        });

        this.api.attachPermissions([table]);

        const outputs = {
            "url": this.api.url,
            "createarn": this.api.getFunction(routeNames.put).functionArn,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}