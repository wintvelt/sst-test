// handler for GET route
import middy from '@middy/core'
import { sns } from './libs/sns-lib'

const postTopic = (message, messageAttr) => sns.publish({
    Message: message,
    MessageAttributes: messageAttr,
    TopicArn: process.env.TOPIC_ARN,
    // MessageDeduplicationId: Date.now().toString(),  // Required for FIFO
    // MessageGroupId: "deps",  // Required for FIFO
})

const createMessage = (record) => {
    const isDeleted = (record.eventName === 'REMOVE')
    const isNew = (record.eventName === 'INSERT')
    const data = record.dynamodb
    return {
        eventName: record.eventName,
        packageStage: (isDeleted) ? data.OldImage.packageStage.S : data.NewImage.packageStage.S,
        dependency: (isDeleted) ? data.OldImage.dependency.S : data.NewImage.dependency.S,
        version: (isDeleted) ? undefined : data.NewImage.version.S,
        oldVersion: (isNew) ? undefined : data.OldImage.version.S,
        createdAt: (isDeleted) ? data.OldImage.createdAt.S : data.NewImage.createdAt.S
    }
}

const attr = (string) => ({
    DataType: 'String',
    StringValue: string
})

const createMessageAttr = (messageRec) => {
    return {
        eventName: attr(messageRec.eventName),
        packageStage: attr(messageRec.packageStage),
        dependency: attr(messageRec.dependency),
    }
}

const handleRecord = (record) => {
    const messageRec = createMessage(record)
    const messageAttr = createMessageAttr(messageRec)
    return postTopic(JSON.stringify(messageRec), messageAttr)
}

const baseHandler = async (event) => {
    const Records = event.Records || []
    let updates = []
    for (let i = 0; i < Records.length; i++) {
        const record = Records[i]
        updates.push(handleRecord(record))
    }
    const results = await Promise.all(updates)
    if (results.some(tuple => tuple[0])) throw new Error(err.message)
    console.log(results.map(tuple => tuple[1]))
    return "OK"
}

const handler = middy(baseHandler)

// module exports to make Open Telemetry work for logz.io
module.exports = { handler, createMessage, createMessageAttr }