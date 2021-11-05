import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../stacks/apiStack";
import DbStack from "../stacks/DbStack";

test("Test Stack", () => {
  const app = new sst.App();

  const dbStack = new DbStack(app, "dependencies");

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table,
  });

  expect(dbStack).to(haveResource("AWS::DynamoDB::Table"));
  expect(apiStack).to(haveResource("AWS::Lambda::Function"));
});
