import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../../stacks/apiStack";
import DbStack from "../../stacks/DbStack";
import queueStack from "../../stacks/queueStack";

test("Test Stack", () => {
  const app = new sst.App();

  const dbStack = new DbStack(app, "dependencies");

  const queue = new queueStack(app, "dependencyQueue", {
    table: dbStack.table
  })

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table,
    queue: queue.queue
  })

  expect(dbStack).to(haveResource("AWS::DynamoDB::Table"));
  expect(queue).to(haveResource("AWS::SQS::Queue"));
  expect(apiStack).to(haveResource("AWS::Lambda::Function"));
});
