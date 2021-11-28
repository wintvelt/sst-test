// tests for the PUT endpoint = create function
// tests only business logic, no persistent DB updates
import { makeLatest, splitNewChanged } from '../../src/create';
import { createMessage } from '../../src/dbConsumer';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'create-dep': '1.0.0' } },
    }
}

const baseItem = {
    packageStage: 'dev-test-run',
    dependency: 'create-dep',
    version: '1.0.0',
    createdAt: expect.anything()
}

const oldDeps = [
    {
        packageStage: 'dev-put-api-async-test',
        createdAt: '2021-11-28T16:43:16.506Z',
        version: '0.0.3',
        dependency: 'firstdep'
    }
]
const latestDeps = [
    {
        packageStage: 'dev-put-api-async-test',
        dependency: 'firstdep',
        version: '0.0.3',
        createdAt: '2021-11-28T16:52:12.227Z'
    }
]

const record = {
    eventName: 'INSERT',
    dynamodb: {
        ApproximateCreationDateTime: 1638137679,
        Keys: {
            dependency: { S: 'firstdep' },
            packageStage: { S: 'dev-put-api-async-test' }
        },
        NewImage: {
            createdAt: { S: '2021-11-28T22:14:39.047Z' },
            dependency: { S: 'firstdep' },
            version: { S: '0.0.3' },
            packageStage: { S: 'dev-put-api-async-test' }
        },
        SequenceNumber: '2900000000016695167612',
        SizeBytes: 149,
        StreamViewType: 'NEW_AND_OLD_IMAGES'
    }
}


test("Test making update Item", () => {
    const result = makeLatest(baseEvent)
    expect(result).toHaveLength(1)
    const Item = result[0]
    expect(Item).toMatchObject(baseItem)
})

test("Test splitting new/changed/unchanged in dependencies", () => {
    const { depsToAdd, depsToChange, unchanged } = splitNewChanged(oldDeps, latestDeps);
    expect(depsToAdd).toHaveLength(0)
    expect(depsToChange).toHaveLength(0)
    expect(unchanged).toBe(1)
})

test("Create topic message from db stream record", () => {
    const message = createMessage(record)
    expect(message.eventName).toBe('INSERT')
    expect(message.version).toBe('0.0.3')
    expect(message.oldVersion).toBe(undefined)
})