//test get api endpoint
import axios from 'axios'
import urls from '../../npm/apiEndpoints'

const url = urls.put.dev
const Authorization = `Basic ${process.env.SECRET_PUBLISH_TOKEN}`

const body = {
    ownerName: 'wintvelt/put-api-test',
    stage: 'dev',
    pack: { dependencies: { 'firstdep': '0.0.3', 'seconddep': '0.10.0' } },
}


test("API Put an update", async () => {
    let result
    try {
        result = await axios.put(url, body, { headers: { Authorization } })
        // if (result.status > 299) throw new Error(result.statusText)
    } catch (error) {
        result = error
    }
    expect(result).toHaveProperty("statusText")
    expect(result.status).toBe(200)
    expect(result).toHaveProperty("data")
})

test("API Put invalid update should return error", async () => {
    let result
    const invalidBody = { ...body, stage: "WRONG" }
    try {
        result = await axios.put(url, invalidBody, { headers: { Authorization } })
        // if (result.status > 299) throw new Error(result.statusText)
    } catch (error) {
        result = error.response
    }
    expect(result).toHaveProperty("statusText")
    expect(result.status).toBe(400)
    expect(result.data).toBe('Event object failed validation')
})