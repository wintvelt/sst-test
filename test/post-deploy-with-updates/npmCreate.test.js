// tests for the PUT endpoint = create function
import { invokeCreate } from '../../npm/functions';

const testDevOnly = (...args) =>
    (process.env.STAGE !== 'prod') ? test(...args) : test.skip(...args);

const baseEvent = {
    body: {
        ownerName: 'wintvelt/npm-create-test',
        stage: 'dev',
        pack: { dependencies: { 'firstdep': '0.0.1' } },
    }
}

testDevOnly("Test invoking create lambda from npm", async () => {
    let result = {}
    try {
        result = await invokeCreate(baseEvent)
    } catch (error) {
        result.statusCode = 500
        result.message = error.message
    }
    expect(result.statusCode).toBeLessThanOrEqual(299)
})

console.log(process.env)
// testDevOnly("Test invoking create lambda from npm with wrong body", async () => {
//     let result = {}
//     try {
//         result = await invokeCreate({ body: { ...baseEvent.body, stage: 'WRONG' } })
//     } catch (error) {
//         console.log(error)
//         result.statusCode = 500
//         result.message = error.message
//     }
//     console.log(result)
//     expect(result.statusCode).toBe(500)
// })