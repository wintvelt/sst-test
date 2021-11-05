import * as sst from "@serverless-stack/resources";

export default class ApiStack extends sst.Stack {
  // Public reference to the API
  api;

  constructor(scope, id, props) {
    super(scope, id, props);

    const { table } = props;

    // Create the API
    this.api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        environment: {
          TABLE_NAME: table.tableName,
          SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
        },
      },
      defaultThrottlingRateLimit: 500,
      defaultThrottlingBurstLimit: 100,
      routes: {
        "PUT    /": "src/create.handler",
        "GET    /{id}": "src/get.handler"
      },
    });

    // Allow the API to access the table
    this.api.attachPermissions([table]);

    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: this.api.url,
    });
  }
}