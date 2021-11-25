import * as sst from "@serverless-stack/resources";

export default class DbStack extends sst.Stack {
  // Public reference to the table
  table;

  constructor(scope, id, props) {
    super(scope, id, props);

    const { topic } = props

    // Create the DynamoDB table
    this.table = new sst.Table(this, "dependencies", {
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
          topicName: topic.topicName,
          SENTRY_DSN: process.env.SENTRY_DSN,
        },
        permissions: [topic],
      },
      stream: true,
      consumers: {
        consumer1: "src/dbConsumer.handler",
      }
    });
  }
}