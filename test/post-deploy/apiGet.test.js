//test get api endpoint
import axios from 'axios'
import urls from '../../npm/urls'
import { apiCall } from '../../src/libs/promise-lib'

const getUrl = urls.get.dev // only test on dev stack
const Authorization = `Basic ${process.env.SECRET_PUBLISH_TOKEN}`

test("API GET retrieve list of publications", async () => {
    const [error, result] = await apiCall(axios.get(getUrl, { headers: { Authorization } }))
    if (result.status > 299) throw new Error(result.statusText)

    expect(error).toBeNull()
    expect(result).toHaveProperty("data")
    expect(Array.isArray(result.data)).toBe(true)
})

test("API GET with wrong Auth", async () => {
    const [error, result] = await apiCall(axios.get(getUrl, { headers: { Authorization: 'FOUT' } }))
    
    expect(result).toBeNull()
    expect(error.response.status).toBe(401)
})