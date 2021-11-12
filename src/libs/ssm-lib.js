import { SSM } from 'aws-sdk';

const ssmClient = new SSM({
    apiVersion: '2014-11-06',
});

export const ssm = {
    getParameter: (params) => ssmClient.getParameter(params).promise(),
    putParameter: (params) => ssmClient.putParameter(params).promise()
}