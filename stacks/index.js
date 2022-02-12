import TableStack from './tableStack.js'
import ApiStack from './apiStack.js'

export default function main(app) {
    const tableStack = new TableStack(app, "table", {})
    const apiStack = new ApiStack(app, "api", {
        table: tableStack.table,
    })
}