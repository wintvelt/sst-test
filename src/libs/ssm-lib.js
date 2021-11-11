import { SSM } from 'aws-sdk';

const ssmClient = new SSM({
  apiVersion: '2014-11-06'
});

const stage = process.env.STAGE
const repo = process.env.REPO
const service = (repo)? repo.split('/')[1] : undefined

export const ssm = {
    getParameter: (params) => ssmClient.getParameter(params).promise(),
    putParameter: (params) => ssmClient.putParameter(params).promise()
}

export const publishOutput = async (params) => {
    let updates = []
    for (const key in params) {
        if (Object.hasOwnProperty.call(params, key)) {
            const value = params[key]
            const name = `${stage}-${service}-${key}`
            updates.push({
                "Overwrite": true,
                "Type": "String",
                "Name": name,
                "Value": value,
                "Description": `Auto published on deploy to ${stage} from ${repo}`
            })
        }
    }
}