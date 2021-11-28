import AWS from "aws-sdk";

const snsClient = new AWS.SNS({apiVersion: '2010-03-31'})

export const sns = {
    publish: (params) => snsClient.publish(params).promise()
}