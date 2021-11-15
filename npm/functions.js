// client functions for dependencies
import { lambda } from '../src/libs/lambda-lib'

// import both stackoutputs
import devStageOutput from './dev-stack-output.json'
import prodStageOutput from './dev-stack-output.json'

// only dev and prod will be deployed
const stage = process.env.STAGE
const stageCheck = (stage === 'prod' || stage === 'dev')

// dynamic import based on stage
async function importModule(stage) {
    // const stackOutputFile = `./${stage}-stack-output.json`
    // let stackOutput
    // let stackOutput
    // try {
    //    stackOutput = await import(stackOutputFile)
    // } catch (error) {
    //    console.error('could not import stackoutput file')
    //    throw new Error(error.message)
    // }
    // return stackOutput
    return stackOutputFile = (stage === 'prod')? prodStageOutput : devStageOutput
 }

const invoke = async ({event, stackName, functionName}) => {
    if (!stageCheck) throw new Error('environment stage not set')

    let stackOutput
    try {
        stackOutput = await importModule(stage)
    } catch (error) {
        console.error('could not get endpoints')
        throw new Error(error.message)
    }
    const functionArn = stackOutput[`${stage}-${stackName}`][functionName]
    const lambdaParams = {
        FunctionName: functionArn,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(event)
    }

    let parsedResult = {}
    try {
        const result = await lambda.invoke(lambdaParams)
        parsedResult = JSON.parse(result.Payload)
        if (parsedResult.statusCode > 299) {
            throw new Error(`lambda invoke failed with statuscode ${parsedResult.statusCode} message ${parsedResult.body}`)
        }
    } catch (error) {
        console.error('invoke lambda failed')
        throw new Error(error.message)
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
        functionName: 'createAsyncarn'
    })
}