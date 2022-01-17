// arns.js
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

export default {
    put: {
        dev: devStageOutput['dev-sst-test-api']?.createarn,
        prod: prodStageOutput['prod-sst-test-api']?.createarn,
    },
    putAsync: {
        dev: devStageOutput['dev-sst-test-asyncApi']?.createasyncarn,
        prod: prodStageOutput['prod-sst-test-asyncApi']?.createasyncarn,
    },
    dlq: {
        dev: devStageOutput['dev-sst-test-dlq']?.arn,
        prod: prodStageOutput['prod-sst-test-dlq']?.arn,
    },
    failover: {
        dev: devStageOutput['dev-sst-test-table']?.arn,
        prod: prodStageOutput['prod-sst-test-table']?.arn,
    },
}
