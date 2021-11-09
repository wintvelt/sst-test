import DbStack from "./DbStack";
import ApiStack from "./apiStack";
import queueStack from "./queueStack";

export default function main(app) {
  const dbStack = new DbStack(app, "dependencies")

  const queue = new queueStack(app, "dependencyQueue", {
    table: dbStack.table
  })

  new ApiStack(app, "api", {
    table: dbStack.table,
    queue: queue.queue
  })
}