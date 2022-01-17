import DbStack from "./dbStack"
import TopicStack from "./topicStack"
import ApiStack from "./apiStack"
import AsyncApiStack from "./apiAsyncStack"
import DlqStack from "./dlqStack"

export default function main(app) {
  const topicStack = new TopicStack(app, "topic")

  const dbStack = new DbStack(app, "table", {
    topic: topicStack.topic
  })

  const dlqStack = new DlqStack(app, "dlq")

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table,
    dlq: dlqStack.queue
  })

  new AsyncApiStack(app, "asyncApi", {
    api: apiStack.api
  })
}