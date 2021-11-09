import AWS from "aws-sdk";

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

export const sqs = {
    sendMessage: (params) => sqs.sendMessage(params).promise()
}