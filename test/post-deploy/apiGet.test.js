//test get api endpoint
import axios from 'axios'
import urls from '../../npm/apiEndpoints'

const getUrl = urls.get.dev // only test on dev stack
const Authorization = `Basic ${process.env.SECRET_PUBLISH_TOKEN}`

test("API GET retrieve list of publications", async () => {
    let result
    try {
        result = await axios.get(getUrl, { headers: { Authorization } })
        if (result.status > 299) throw new Error(result.statusText)
    } catch (error) {
        result = error
    }
    expect(result).toHaveProperty("data")
    expect(Array.isArray(result.data)).toBe(true)
})

test("API GET with wrong Auth", async () => {
    let result
    try {
        result = await axios.get(getUrl, { headers: { Authorization: 'FOUT' } })
        if (result.status > 299) throw new Error(result.statusText)
    } catch (error) {
        result = error.response
    }
    expect(result.status).toBe(401)
})