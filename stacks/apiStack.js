import { lambdaAuthorizerProps } from "../src/libs/lambda-authorizer-lib";
import * as sst from "@serverless-stack/resources";
// import { tracingEnvProps, tracingLayerProps } from "../src/libs/lambda-layers-lib";
import * as cdk from "@aws-cdk/core"

const routeNames = {
    get: "GET   /",
    put: "PUT   /",
}

const envProps = (env, table) => ({
    // ...tracingEnvProps,
    TABLE_NAME: table.tableName,
    SECRET_PUBLISH_TOKEN: env.SECRET_PUBLISH_TOKEN,
    STAGE: env.STAGE,
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
})

export default class ApiStack extends sst.Stack {
    // Public reference to the API
    api;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { table, dlq } = props;

        // Create the API
        this.api = new sst.Api(this, "api", {
            ...lambdaAuthorizerProps(this, "src/authorizer.handler", process.env),
            defaultThrottlingRateLimit: 2000,
            defaultThrottlingBurstLimit: 500,
            routes: {
                [routeNames.get]: new sst.Function(this, "getHandler", {
                    handler: "src/get.handler",
                    environment: envProps(process.env, table),
                    // ...tracingLayerProps(this, "get")
                }),
                [routeNames.put]: new sst.Function(this, "putHandler", {
                    handler: "src/create.handler",
                    deadLetterQueue: dlq.sqsQueue,
                    environment: envProps(process.env, table),
                    // ...tracingLayerProps(this, "put")
                }),
            },
        });

        this.api.attachPermissions([table]);

        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )

        const outputs = {
            "url": this.api.url,
            "createarn": this.api.getFunction(routeNames.put).functionArn,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}