import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../../stacks/apiStack";
import DbStack from "../../stacks/DbStack";
import TopicStack from "../../stacks/topicStack";

test("Test Stack", () => {
  const app = new sst.App();

  const topicStack = new TopicStack(app, "topic");

  const dbStack = new DbStack(app, "dependencies", {
    topic: topicStack.topic
  });

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table,
  })

  expect(dbStack).to(haveResource("AWS::DynamoDB::Table"));
  expect(apiStack).to(haveResource("AWS::Lambda::Function"));
});
