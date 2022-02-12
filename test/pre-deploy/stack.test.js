import { Template } from "aws-cdk-lib/assertions";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../../stacks/apiStack";
import TableStack from "../../stacks/TableStack";

test("Test Stack", () => {
  const app = new sst.App();

  const tableStack = new TableStack(app, "table", {});

  const apiStack = new ApiStack(app, "api", {
    table: tableStack.table
  })
  const apiTemplate = Template.fromStack(apiStack)
  apiTemplate.hasResourceProperties("AWS::Lambda::Function", {})

  const dbTemplate = Template.fromStack(tableStack)
  dbTemplate.hasResourceProperties("AWS::DynamoDB::Table", {})
});
