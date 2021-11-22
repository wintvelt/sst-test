import DbStack from "./DbStack";
import ApiStack from "./apiStack";
import AsyncApiStack from "./apiAsyncStack";

const routeNames = {
  get: "GET   /",
  put: "PUT   /",
}

export default function main(app) {
  const dbStack = new DbStack(app, "dependencies")

  const apiStack = new ApiStack(app, "api", {
    table: dbStack.table
  })

  new AsyncApiStack(app, "asyncApi", {
    apiFunctionArn: apiStack.api.getFunction(routeNames.put).functionArn
  })
}