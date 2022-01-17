// urls.js
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

export default {
    get: {
        dev: devStageOutput['dev-sst-test-api']?.url,
        prod: prodStageOutput['prod-sst-test-api']?.url,
    },
    put: {
        dev: devStageOutput['dev-sst-test-api']?.url,
        prod: prodStageOutput['prod-sst-test-api']?.url,
    },
    putAsync: {
        dev: devStageOutput['dev-sst-test-asyncApi']?.asyncurl,
        prod: prodStageOutput['prod-sst-test-asyncApi']?.asyncurl,
    },
    dlq: {
        dev: devStageOutput['dev-sst-test-dlq']?.url,
        prod: prodStageOutput['prod-sst-test-dlq']?.url,
    },
    failover: {
        dev: devStageOutput['dev-sst-test-table']?.url,
        prod: prodStageOutput['prod-sst-test-table']?.url,
    },
}
