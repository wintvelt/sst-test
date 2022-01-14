//test get api endpoint
import axios from 'axios'
import urls from '../../npm/apiEndpoints'
import { apiCall } from '../../src/libs/promise-lib'

const url = urls.putAsync.dev // only test on dev stack
const Authorization = `Basic ${process.env.SECRET_PUBLISH_TOKEN}`

const body = {
    ownerName: 'wintvelt/put-api-async-test',
    stage: 'dev',
    pack: { dependencies: { 'firstdep': '0.0.3' } },
}


test("API Put Async an update", async () => {
    const [error, result] = await apiCall(axios.put(url, body, { headers: { Authorization } }))
    
    expect(error).toBeNull()
    expect(result).toHaveProperty("statusText")
    expect(result.status).toBe(200)
})