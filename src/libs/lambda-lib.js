import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"

AWSXRay.setContextMissingStrategy("LOG_ERROR")
const AWSWrapped = AWSXRay.captureAWS(AWS)

const lambdaFunc = new AWSWrapped.Lambda()

export const lambda = {
    invoke: (params) => lambdaFunc.invoke(params).promise()
}