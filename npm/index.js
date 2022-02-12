// Client for publishing dependencies
import { importModule } from "./stack-output-lib.js"
import { invoke } from "./lib/function-lib"

const stackOutput = (stage) => importModule(stage)

// access to arns
export const arns = {
    dev: {
        createArn: stackOutput('dev')['dev-sst-test-api'].createArn,
        dlqQueueArn: stackOutput(`dev`)['dev-sst-test-api'].dlqQueueArn,
        topicArn: stackOutput(`dev`)['dev-sst-test-table'].topicArn,
        failoverArn: stackOutput(`dev`)['dev-sst-test-table'].failoverArn,
    },
    prod: {
        createArn: stackOutput('prod')['prod-sst-test-api'].createArn,
        dlqQueueArn: stackOutput(`prod`)['prod-sst-test-api'].dlqQueueArn,
        topicArn: stackOutput(`prod`)['prod-sst-test-table'].topicArn,
        failoverArn: stackOutput(`prod`)['prod-sst-test-table'].failoverArn,
    }
}

// client functions for dependencies
export const invokeCreate = (event) => {
    return invoke({
        event,
        functionArn: arns[process.env.STAGE || 'dev'].createArn
    })
}

export const invokeCreateAsync = (event) => {
    return invoke({
        event,
        functionArn: arns[process.env.STAGE || 'dev'].createArn,
        async: true
    })
}

export const urls = {
    dev: {
        failoverQueueUrl: stackOutput('dev')['dev-sst-test-table'].failoverQueueUrl,
        url: stackOutput(`dev`)['dev-sst-test-api'].url,
        dlqQueueUrl: stackOutput(`dev`)['dev-sst-test-api'].dlqQueueUrl
    },
    prod: {
        failoverQueueUrl: stackOutput('prod')['prod-sst-test-table'].failoverQueueUrl,
        url: stackOutput(`prod`)['prod-sst-test-api'].url,
        dlqQueueUrl: stackOutput(`prod`)['prod-sst-test-api'].dlqQueueUrl
    }
}
