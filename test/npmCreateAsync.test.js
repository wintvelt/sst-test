// tests for the PUT ASYNC endpoint = createAsync function
import { invokeCreateAsync } from '../npm/functions';

const testNotProd = (...args) =>
  (process.env.STAGE !== 'prod') ? test(...args) : test.skip(...args);

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'async-dep': '0.0.1' } },
    }
}

testNotProd("Test invoking create lambda from npm", async () => {
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