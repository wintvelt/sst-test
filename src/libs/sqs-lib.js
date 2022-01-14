// import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"
import { apiCall } from "./promise-lib"

// AWSXRay.setContextMissingStrategy("LOG_ERROR")
// const AWSWrapped = AWSXRay.captureAWS(AWS)

const sqsQueue = new AWS.SQS({ apiVersion: '2012-11-05' })

export const sqs = {
    sendMessage: (params) => apiCall(sqsQueue.sendMessage(params).promise())
}