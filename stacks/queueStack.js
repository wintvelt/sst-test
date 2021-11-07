// for external services to post commands to
import * as sst from "@serverless-stack/resources"

export default class queueStack extends sst.Stack {
    // Public reference to the queue
    queue;

    constructor(scope, id, props) {
        super(scope, id, props);

        const { table } = props;

        this.queueHandler = new sst.Function(this, "queueHandler", {
            handler: "src/queueConsumer.handler",
            environment: {
                TABLE_NAME: table.tableName
            }
        })

        // Create the SQS Queue
        this.queue = new sst.Queue(this, "dependencyQueue", {
            consumer: this.queueHandler,
            sqsQueue: {
                fifo: true,
            },
        });

        this.queue.attachPermissions([table]);

        // Show the endpoint in the output
        this.addOutputs({
            QueueURL: this.queue.sqsQueue.queueUrl,
            QueueARN: this.queue.sqsQueue.queueArn,
        });

    }
}