import DbStack from "./DbStack";
import ApiStack from "./apiStack";
import queueStack from "./queueStack";

export default function main(app) {
  const dbStack = new DbStack(app, "dependencies")

  new ApiStack(app, "api", {
    table: dbStack.table,
  })

  new queueStack(app, "dependencyQueue", {
    table: dbStack.table
  })
}