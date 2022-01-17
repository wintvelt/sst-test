//test get api endpoint
import axios from 'axios'
import urls from '../../npm/urls'
import { apiCall } from '../../src/libs/promise-lib'

const url = urls.put.dev
const Authorization = `Basic ${process.env.SECRET_PUBLISH_TOKEN}`

const body = {
    ownerName: 'wintvelt/put-api-test',
    stage: 'dev',
    pack: { dependencies: { 'firstdep': '0.0.3', 'seconddep': '0.10.0' } },
}


test("API Put an update", async () => {
    const [error, result] = await apiCall(axios.put(url, body, { headers: { Authorization } }))

    expect(error).toBeNull()
    expect(result).toHaveProperty("statusText")
    expect(result.status).toBe(200)
    expect(result).toHaveProperty("data")
})

test("API Put invalid update should return error", async () => {
    const invalidBody = { ...body, stage: "WRONG" }
    const [error, result] = await apiCall(axios.put(url, invalidBody, { headers: { Authorization } }))

    expect(result).toBeNull()
    expect(error.response).toHaveProperty("statusText")
    expect(error.response.status).toBe(400)
    expect(error.response.data).toBe('Event object failed validation')
})