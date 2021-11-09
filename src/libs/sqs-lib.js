import AWS from "aws-sdk";

const sqsQueue = new AWS.SQS({ apiVersion: '2012-11-05' })

export const sqs = {
    sendMessage: (params) => sqsQueue.sendMessage(params).promise()
}