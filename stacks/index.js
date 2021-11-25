import DbStack from "./DbStack";
import TopicStack from "./topicStack";
import ApiStack from "./apiStack";
import AsyncApiStack from "./apiAsyncStack";

export default function main(app) {
  const topicStack = new TopicStack(app, "topic")

  const dbStack = new DbStack(app, "dependencies", {
    topic: topicStack.topic
  })

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table
  })

  new AsyncApiStack(app, "asyncApi", {
    api: apiStack.api
  })
}