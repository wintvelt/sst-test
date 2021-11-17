import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers";
import * as sst from "@serverless-stack/resources";

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
                resultsCacheTtl: 0 // turn off cache to prevent weird errors
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