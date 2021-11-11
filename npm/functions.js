// client functions for dependencies
import { lambda } from '../src/libs/lambda-lib'
import { ssm } from '../src/libs/ssm-lib'

const stageCheck = (process.env.STAGE === 'prod' || process.env.STAGE === 'dev')

export const invokeCreate = async (package) => {
    if (!stageCheck) throw new Error('environment stage not set')

    const stage = process.env.STAGE

    // retrieve functionname from parameter store
    const key = {
        Name: `${stage}-${package.name}-invokeCreate-arn`
    }
    let functionName
    try {
        const param = await ssm.getParameter(key)
        functionName = param.Parameter.Value
    } catch (error) {
        console.error('could not retrieve function name')
        throw new Error(error.message)
    }

    // invoke the lambda
    const lambdaParams = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: body
    }

    let result
    try {
        result = await lambda.invoke(lambdaParams)
        if (result.statusCode > 299) throw new Error(`lambda invoke failed with statuscode ${result.statusCode}`)
    } catch (error) {
        console.error('invoke lambda failed')
        throw new Error(error.message)
    }

    return result
}