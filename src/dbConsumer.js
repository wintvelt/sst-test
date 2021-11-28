// handler for GET route
import middy from '@middy/core'
import errorLogger from '@middy/error-logger'
import sentry from './libs/sentry-lib'
import { sns } from './libs/sns-lib'

const postTopic = (message) => sns.publish({
    Message: JSON.stringify(message),
    TopicArn: process.env.TOPIC_ARN
})

const handleRecord = (record) => {
    const isDeleted = (record.eventName === 'REMOVE')
    const isNew = (record.eventName === 'INSERT')
    return postTopic({
        eventName: record.eventName,
        packageStage: (isDeleted)? record.OldImage.packageStage.S : record.NewImage.packageStage.S,
        dependency: (isDeleted)? record.OldImage.dependency.S : record.NewImage.dependency.S,
        version: (isDeleted)? undefined : record.NewImage.version.S,
        oldVersion: (isNew)? undefined : record.OldImage.version.S,
        createdAt: (isDeleted)? record.OldImage.createdAt.S : record.NewImage.createdAt.S
    })
}

const baseHandler = async (event) => {
    const Records = event.Records || []
    let updates = []
    for (let i = 0; i < Records.length; i++) {
        const record = Records[i]
        updates.push(handleRecord(record))
    }
    const result = await Promise.all(updates)
    console.log(result)
    return "OK"
}

export const handler = middy(sentry(baseHandler))
    .use(errorLogger())
