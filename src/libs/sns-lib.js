// import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"
import { apiCall } from "./promise-lib"

// AWSXRay.setContextMissingStrategy("LOG_ERROR")
// const AWSWrapped = AWSXRay.captureAWS(AWS)

const snsClient = new AWS.SNS({apiVersion: '2010-03-31'})

export const sns = {
    publish: (params) => apiCall(snsClient.publish(params).promise())
}