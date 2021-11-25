import * as sst from "@serverless-stack/resources";

// Dead letter queue for Lambda put (because of async invoke)

export default class DlqStack extends sst.Stack {
    // Public reference
    queue;

    constructor(scope, id, props) {
        super(scope, id, props);

        // Create the Topic
        this.queue = new sst.Queue(this, "dlq")

        const outputs = {
            "arn": this.queue.sqsQueue.queueArn
        }

        // Show the output
        this.addOutputs(outputs);
    }
}