import * as sst from "@serverless-stack/resources";
// import { tracingEnvProps, tracingLayerProps } from "../src/libs/lambda-layers-lib"
import * as cdk from "@aws-cdk/core"

export default class DbStack extends sst.Stack {
    // Public reference to the table
    table;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { topic } = props

        // Create the DynamoDB table
        this.table = new sst.Table(this, "table", {
            fields: {
                packageStage: sst.TableFieldType.STRING,
                dependency: sst.TableFieldType.STRING,
            },
            primaryIndex: { partitionKey: "packageStage", sortKey: "dependency" },
            globalIndexes: {
                dependencyIndex: { partitionKey: "dependency", sortKey: "packageStage" },
            },
            defaultFunctionProps: {
                timeout: 20,
                environment: {
                    TOPIC_ARN: topic.topicArn,
                    SENTRY_DSN: process.env.SENTRY_DSN,
                    STAGE: process.env.STAGE,
                    // ...tracingEnvProps
                },
                // ...tracingLayerProps(this, "db"),
                permissions: [topic],
            },
            stream: true,
            consumers: {
                consumer1: "src/dbConsumer.handler",
            }
        })

        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )

    }
}