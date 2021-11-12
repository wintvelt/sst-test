// import { SSM } from 'aws-sdk';
const { SSM } = require('aws-sdk');

const ssmClient = new SSM({
    apiVersion: '2014-11-06',
    region: 'eu-central-1'
});

const stage = process.env.STAGE
const repo = process.env.REPO
const service = (repo) ? repo.split('/')[1] : undefined

const ssm = {
    getParameter: (params) => ssmClient.getParameter(params).promise(),
    putParameter: (params) => ssmClient.putParameter(params).promise()
}

const publishOutput = async (output) => {
    let params = {}
    for (const stackName in output) {
        if (Object.hasOwnProperty.call(output, stackName)) {
            if (stackName.slice(-4) === '-api') {
                const itemOutput = output[stackName];
                for (const name in itemOutput) {
                    if (Object.hasOwnProperty.call(itemOutput, name)) {
                        const cleanedName = (name.length > 3)? name.slice(0, -3) + '-' + name.slice(-3) : name
                        const value = itemOutput[name]
                        params[cleanedName] = value
                    }
                }
            }
        }
    }

    // write to parameter store
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
    const promises = updates.map(ssm.putParameter)
    try {
        await Promise.all(promises)
    } catch (error) {
        console.error('Could not publish to parameter store')
        throw new Error(error.message)
    }
}

module.exports = { publishOutput }