// arns.js
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

export default {
    put: {
        dev: devStageOutput['dev-sst-test-api']?.createarn,
        prod: prodStageOutput['prod-sst-test-api']?.createarn,
    }
}
