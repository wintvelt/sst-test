// client functions for dependencies
import { invoke } from "./lib/function-lib"

export const invokeCreate = (event) => {
    return invoke({
        event,
        stackName: 'sst-test-api',
        functionName: 'createarn'
    })
}

export const invokeCreateAsync = (event) => {
    return invoke({
        event,
        stackName: 'sst-test-api',
        functionName: 'createarn',
        async: true
    })
}