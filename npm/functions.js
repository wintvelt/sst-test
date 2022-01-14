// client functions for dependencies
import { lambda } from '../src/libs/lambda-lib'

// import both stackoutputs
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

// only dev and prod will be deployed
const stage = process.env.STAGE
const stageCheck = (stage === 'prod' || stage === 'dev')

// dynamic import based on stage not possible for some reason
function importModule(stage) {
    return stackOutputFile = (stage === 'prod') ? prodStageOutput : devStageOutput
}

const invoke = async ({ event, stackName, functionName, async }) => {
    if (!stageCheck) throw new Error('environment stage not set')

    const stackOutput = importModule(stage)

    const functionArn = stackOutput[`${stage}-${stackName}`][functionName]
    const lambdaParams = {
        FunctionName: functionArn,
        InvocationType: (async) ? 'Event' : 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(event)
    }

    const [error, result] = await lambda.invoke(lambdaParams)
    if (error) throw new Error(error.message)
    const parsedResult = (async) ?
        { statusCode: result.StatusCode, body: result.Payload }
        : JSON.parse(result.Payload)
    if (parsedResult.statusCode > 299) {
        throw new Error(`lambda invoke failed with statuscode ${parsedResult.statusCode} message ${parsedResult.body}`)
    }

    return parsedResult
}

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