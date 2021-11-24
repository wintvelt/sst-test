// arns.js
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

export default {
    topic: {
        dev: devStageOutput['dev-sst-test-topic']?.createarn,
        prod: prodStageOutput['prod-sst-test-topic']?.createarn,
    }
}
