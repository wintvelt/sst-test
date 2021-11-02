import DbStack from "./DbStack";
import ApiStack from "./apiStack";

export default function main(app) {
  const dbStack = new DbStack(app, "dependencies");

  new ApiStack(app, "api", {
    table: dbStack.table,
  });
}