// wrapper for async await to clean up code
/*
** old:
let data
try {
    data = await someFunc(params)
} catch (error) {
    throw new Error(error)
}
** new:
const [err, data] = await apiCall(someFunc(params))
if (err) throw new Error(error)
*/

export const apiCall = async (promise) => {
    try {
        const data = await promise
        return [null, data]
    } catch (error) {
        return [error, null]
    }
}