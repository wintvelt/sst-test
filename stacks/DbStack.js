import * as sst from "@serverless-stack/resources";

export default class DbStack extends sst.Stack {
  // Public reference to the table
  table;

  constructor(scope, id, props) {
    super(scope, id, props);

    // Create the DynamoDB table
    this.table = new sst.Table(this, "dependencies", {
      fields: {
        packageStage: sst.TableFieldType.STRING,
        dependency: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: "packageStage", sortKey: "dependency" },
    });
  }
}