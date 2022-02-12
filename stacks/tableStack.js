import * as sst from "@serverless-stack/resources"
import * as cdk from "aws-cdk-lib"
// FACTORY_IMPORTS
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { SqsDlq } from 'aws-cdk-lib/aws-lambda-event-sources'

export default class TableStack extends sst.Stack {
    // Public reference to the table
    table

    constructor(scope, id, props) {
        super(scope, id, props);

        const destinations = {
            "topic": new sst.Topic(this, "topic"),
            "failover-queue": new sst.Queue(this, "failoverQueue"),
        }

        const consumers = {
            "dbConsumer.js": new sst.Function(this, "dbConsumer", {
                handler: "src/dbConsumer.handler",
                timeout: 20,
                environment: {
                    STAGE: scope.stage,
                    TOPIC: destinations["topic"].topicArn,
                },
                permissions: [
                    destinations["topic"],
                ],
            }),
        }

        // Create the DynamoDB table
        this.table = new sst.Table(this, "table", {
            fields: {
                myKey: sst.TableFieldType.STRING,
                myOtherKey: sst.TableFieldType.STRING,
            },
            primaryIndex: { partitionKey: "myKey", sortKey: "myOtherKey" },
            globalIndexes: {
                myIndex: { partitionKey: "myOtherKey", sortKey: "myKey" },
            },
            stream: true,
            consumers: {
                "dbConsumer": {
                    function: consumers["dbConsumer.js"],
                    consumerProps: {
                        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
                        onFailure: new SqsDlq(destinations["failover-queue"].sqsQueue),
                    },
                },
            },
        })
        
        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )

        const outputs = {
            "topicArn": destinations["topic"].topicArn,
            "failoverQueueArn": destinations["failover-queue"].sqsQueue.queueArn,
            "failoverQueueUrl": destinations["failover-queue"].sqsQueue.queueUrl,
        }

        // Show the failover queue endpoint in the output
        this.addOutputs(outputs);
    }
}