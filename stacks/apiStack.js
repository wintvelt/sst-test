import * as sst from "@serverless-stack/resources";

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
          QUEUE_NAME: queue.queueName,
          SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
        },
      },
      defaultThrottlingRateLimit: 500,
      defaultThrottlingBurstLimit: 100,
      routes: {
        "PUT   /": "src/create.handler",
        "PUT   /async": "src/createAsync.handler",
        "GET   /": "src/get.handler"
      },
    });

    // Allow the API to access the table
    this.api.attachPermissions([table]);
    this.api.attachPermissionsToRoute("PUT   /async",[queue])

    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: this.api.url,
    });
  }
}