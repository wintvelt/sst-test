// tests for the PUT endpoint = create function
import { handler } from '../src/create';

const baseEvent = {
    body: {
        ownerName: 'wintvelt/test-run',
        stage: 'dev',
        pack: { dependencies: { 'firstdep': '0.0.1' } },
        authToken: `Basic ${process.env.SECRET_PUBLISH_TOKEN}`
    }
}

test("Test invalid requests", async () => {
    const result = await handler(baseEvent)
    console.log(result)
})