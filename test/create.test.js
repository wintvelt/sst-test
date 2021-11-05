// tests for the PUT endpoint = create function
import { makeUpdates } from '../src/create';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'firstdep': '0.0.1' } },
        authToken: `Basic ${process.env.SECRET_PUBLISH_TOKEN}`
    }
}

const baseItem = {
    packageStage: 'dev-test-run',
    dependency: 'firstdep',
    version: '0.0.1',
    createdAt: expect.anything()
  }

test("Test making updates", () => {
    const result = makeUpdates(baseEvent)
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveProperty('Item')
    const Item = result[0].Item
    expect(Item).toMatchObject(baseItem)
})