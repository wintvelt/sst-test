// lib for client functions for dependencies
import AWS from "aws-sdk"
// import both stackoutputs
import devStageOutput from '../dev-stack-output.json'
import prodStageOutput from '../dev-stack-output.json'

const lambdaFunc = new AWS.Lambda()

const apiCall = async (promise) => {
    try {
        const data = await promise
        return [null, data]
    } catch (error) {
        return [error, null]
    }
}

const lambda = {
    invoke: (params) => apiCall(lambdaFunc.invoke(params).promise())
}

// only dev and prod will be deployed
const stage = process.env.STAGE
const stageCheck = (stage === 'prod' || stage === 'dev')

// dynamic import based on stage not possible for some reason
function importModule(stage) {
    return stackOutputFile = (stage === 'prod') ? prodStageOutput : devStageOutput
}

export const invoke = async ({ event, stackName, functionName, async }) => {
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
    if (error) return [error, null]
    const parsedResult = (async) ?
        { statusCode: result.StatusCode, body: result.Payload }
        : JSON.parse(result.Payload)
    if (parsedResult.statusCode > 299) {
        const newError = new Error(
            `lambda invoke failed with statuscode ${parsedResult.statusCode} message ${parsedResult.body}`
        )
        return [newError, null]
    }

    return [null, parsedResult]
}