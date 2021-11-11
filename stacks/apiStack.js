import * as sst from "@serverless-stack/resources";
import { generalPermissions } from "../src/libs/permissions-lib";

const routeNames = {
  get: "GET   /",
  put: "PUT   /",
  putAsync: "PUT   /async"
}

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
        [routeNames.put]: "src/create.handler",
        [routeNames.putAsync]: "src/createAsync.handler",
        [routeNames.get]: "src/get.handler"
      },
    });

    this.api.attachPermissions([table]);
    this.api.attachPermissionsToRoute(routeNames.putAsync,[queue])
    this.api.attachPermissions(generalPermissions);
     
    const outputs = {
      
    }

    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: this.api.url,
      PutFunctionArn: this.api.getFunction(routeNames.put).functionArn
    });
  }
}