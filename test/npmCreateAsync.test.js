// tests for the PUT ASYNC endpoint = createAsync function
import { invokeCreateAsync } from '../npm/functions';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'async-dep': '0.0.1' } },
        authToken: `Basic ${process.env.SECRET_PUBLISH_TOKEN}`
    }
}

test("Test invoking create lambda from npm", async () => {
    let result = {}
    try {
        result = await invokeCreateAsync(baseEvent)
    } catch (error) {
        console.error(error.message)
        result.statusCode = 500
        result.message = error.message
    }
    expect(result.statusCode).toBeLessThanOrEqual(299)
})

// test("Test invoking create lambda from npm with wrong token", async () => {
//     let result = {}
//     try {
//         result = await invokeCreateAsync({ body: { ...baseEvent.body, authToken: 'WRONG' } })
//     } catch (error) {
//         result.statusCode = 500
//         result.message = error.message
//     }
//     expect(result.statusCode).toBe(500)
// })