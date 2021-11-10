import AWS from "aws-sdk"

const lambdaFunc = new AWS.Lambda()

export const lambda = {
    invoke: (params) => lambdaFunc.invoke(params).promise()
}