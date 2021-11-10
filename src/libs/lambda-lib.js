import AWS from "aws-sdk"

const lambdaFunc = new AWS.Lambda()

export const lambda = {
    invoke: (params) => lambda.invoke(params).promise()
}