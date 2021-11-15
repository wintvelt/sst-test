// tests for the PUT endpoint = create function
import { makeLatest } from '../src/create';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'create-dep': '1.0.0' } },
        authToken: `Basic ${process.env.SECRET_PUBLISH_TOKEN}`
    }
}

const baseItem = {
    packageStage: 'dev-test-run',
    dependency: 'create-dep',
    version: '1.0.0',
    createdAt: expect.anything()
}

test("Test making update Item", () => {
    const result = makeLatest(baseEvent)
    console.log(result)
    expect(result).toHaveLength(1)
    const Item = result[0]
    expect(Item).toMatchObject(baseItem)
})