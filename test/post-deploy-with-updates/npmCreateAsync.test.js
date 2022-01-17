// tests for the PUT ASYNC endpoint = createAsync function
import { invokeCreateAsync } from '../../npm/functions';

const testDevOnly = (...args) =>
    (process.env.STAGE !== 'prod') ? test(...args) : test.skip(...args);

const baseEvent = {
    body: {
        ownerName: 'wintvelt/npm-create-async-test',
        stage: 'dev',
        pack: { dependencies: { 'async-dep': '0.0.1' } },
    }
}

testDevOnly("Test invoking create lambda async from npm", async () => {
    const [error, result] = await invokeCreateAsync(baseEvent)

    expect(error).toBeNull()
    expect(result.statusCode).toBeLessThanOrEqual(299)
})