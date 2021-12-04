import AWSXRay from "aws-xray-sdk-core"
import AWS from "aws-sdk"

AWSXRay.setContextMissingStrategy("LOG_ERROR")
const AWSWrapped = AWSXRay.captureAWS(AWS)

const snsClient = new AWSWrapped.SNS({apiVersion: '2010-03-31'})

export const sns = {
    publish: (params) => snsClient.publish(params).promise()
}