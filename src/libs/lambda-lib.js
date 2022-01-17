import AWS from "aws-sdk"
import { apiCall } from "./promise-lib"
// import AWSXRay from "aws-xray-sdk-core"

// AWSXRay.setContextMissingStrategy("LOG_ERROR")
// const AWSWrapped = AWSXRay.captureAWS(AWS)

// const lambdaFunc = new AWSWrapped.Lambda()
const lambdaFunc = new AWS.Lambda()

export const lambda = {
    invoke: (params) => apiCall(lambdaFunc.invoke(params).promise())
}