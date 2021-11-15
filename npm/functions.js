// client functions for dependencies
import { lambda } from '../src/libs/lambda-lib'

// only dev and prod will be deployed
const stageCheck = (process.env.STAGE === 'prod' || process.env.STAGE === 'dev')

// dynamic import based on stage
async function importModule() {
    const stackOutputFile = `./${stage}-dev-stackoutput.json`
    let stackOutput
    try {
       stackOutput = await import(stackOutputFile)
    } catch (error) {
       console.error('could not import stackoutput file');
    }
    return stackOutput
 }


export const invokeCreate = async (package) => {
    if (!stageCheck) throw new Error('environment stage not set')

    const stage = process.env.STAGE
    const stackOutput = await importModule()
    const functionArn = stackOutput['dev-sst-test-api']['createarn']

    // invoke the lambda
    const event = { body: {
        ownerName: process.env.REPO,
        stage,
        pack: package,
        authToken: `Basic ${process.env.SECRET_PUBLISH_TOKEN}`
    }}

    const lambdaParams = {
        FunctionName: functionArn,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: JSON.stringify(event)
    }

    let result
    try {
        result = await lambda.invoke(lambdaParams)
        if (result.statusCode > 299) {
            throw new Error(`lambda invoke failed with statuscode ${result.statusCode} message ${result.message}`)
        }
    } catch (error) {
        console.error('invoke lambda failed')
        throw new Error(error.message)
    }

    return result
}