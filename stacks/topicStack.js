import * as sst from "@serverless-stack/resources";

// this is a topic without subscribers
// from the DB stream, events will be published to this topic

export default class TopicStack extends sst.Stack {
    // Public reference
    topic;

    constructor(scope, id, props) {
        super(scope, id, props);

        // Create the Topic
        this.topic = new sst.Topic(this, "topic", {
            snsTopic: {
                fifo: true
            },
        });

        const outputs = {
            "arn": this.topic.topicArn
        }

        // Show the output
        this.addOutputs(outputs);
    }
}