// tests for the PUT endpoint = create function
import { invokeCreate } from '../npm/functions';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'firstdep': '0.0.1' } },
    }
}

test("Test invoking create lambda from npm", async () => {
    let result = {}
    try {
        result = await invokeCreate(baseEvent)
    } catch (error) {
        console.error(error.message)
        result.statusCode = 500
        result.message = error.message
    }
    expect(result.statusCode).toBeLessThanOrEqual(299)
})

test("Test invoking create lambda from npm with wrong token", async () => {
    let result = {}
    try {
        result = await invokeCreate({ body: { ...baseEvent.body, authToken: 'WRONG' } })
    } catch (error) {
        result.statusCode = 500
        result.message = error.message
    }
    expect(result.statusCode).toBe(500)
})