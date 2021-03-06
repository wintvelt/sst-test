import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import ApiStack from "../../stacks/apiStack";
import DbStack from "../../stacks/dbStack";
import TopicStack from "../../stacks/topicStack";
import DlqStack from "../../stacks/dlqStack";

test("Test Stack", () => {
  const app = new sst.App();

  const topicStack = new TopicStack(app, "topic");

  const dbStack = new DbStack(app, "table", {
    topic: topicStack.topic
  });

  const dlqStack = new DlqStack(app, "dlq")

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table,
    dlq: dlqStack.queue
  })

  expect(dbStack).to(haveResource("AWS::DynamoDB::Table"));
  expect(apiStack).to(haveResource("AWS::Lambda::Function"));
});
