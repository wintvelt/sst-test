import * as sst from "@serverless-stack/resources"
// import { tracingEnvProps, tracingLayerProps } from "../src/libs/lambda-layers-lib"
import * as cdk from "@aws-cdk/core"
import * as lambda from '@aws-cdk/aws-lambda'
import { SqsDlq } from '@aws-cdk/aws-lambda-event-sources'

export default class DbStack extends sst.Stack {
    // Public reference to the table
    table;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { topic } = props
        const dbConsumer = new sst.Function(this, 'dbConsumer', {
            handler: "src/dbConsumer.main",
            timeout: 20,
            environment: {
                TOPIC_ARN: topic.topicArn,
                SENTRY_DSN: process.env.SENTRY_DSN,
                STAGE: process.env.STAGE,
                // ...tracingEnvProps
            },
            // ...tracingLayerProps(this, "db"),
            permissions: [topic],
        })
        const failureQueue = new sst.Queue(this, "failover-queue")

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
            stream: true,
            consumers: {
                "consumer1": {
                    function: dbConsumer,
                    consumerProps: {
                        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
                        retryAttempts: 5,
                        onFailure: new SqsDlq(failureQueue.sqsQueue)
                    }
                }
            }
        })

        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )

        const outputs = {
            "arn": failureQueue.sqsQueue.queueArn,
            "url": failureQueue.sqsQueue.queueUrl,
            "forceDeploy": "1"
        }
        // Show the failover queue endpoint in the output
        this.addOutputs(outputs);
    }
}