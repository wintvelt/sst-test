// main handler function
import { handler } from "./libs/handler";
import { dynamo } from "./libs/dynamo-lib";
require('dotenv').config()

// validate header before processing
const validator = (lambda => {
    return async function (event, context) {
        // parse event body
        let parsedBody = event.body;
        console.log(typeof event.body)
        console.log(event.body)
        try {
            if (typeof parsedBody === 'string') parsedBody = JSON.parse(event.body)
        } catch (error) {
            // Bad request, could not find event body, so could not Auth
            console.error('could not parse event body')
            return {
                statusCode: 401,
                message: "Unauthorized"
            }
        }
        // token must be in body, because API gateway does not forward header to lambda
        if (parsedBody.AuthToken !== `Basic ${process.env.SECRET_PUBLISH_TOKEN}`) {
            console.error('Auth token mismatch')
            console.log(parsedBody.AuthToken)
            console.log(process.env.SECRET_PUBLISH_TOKEN)
            return {
                statusCode: 401,
                message: "Unauthorized"
            }
        }
        // body must contain name, stage, pack
        if (!(parsedBody.name && parsedBody.stage && parsedBody.pack)) {
            return {
                statusCode: 403,
                message: "body must include name, stage and pack"
            }
        }
        // all good, run lambda
        return lambda(event, context)
    }
})

export const main = validator(
    handler(
        async (event) => {
            // Get data from event body
            const { ownerName, stage, pack } = event.body;
            const name = ownerName.split('/')[1]
            const params = (dependency, version) => {
                return {
                    TableName: process.env.TABLE_NAME,
                    Item: {
                        packageStage: `${stage}-${name}`,
                        dependency,
                        version,
                        createdAt: Date.now(),
                    }
                }
            }

            // ASSUME pack is already parsed
            // const  { dependencies } = pack
            let dependencies = {}
            try {
                dependencies = { ...pack.dependencies }
            } catch (error) {
                throw new Error('pack is not an object yet')
            }

            let updates = []
            for (const key in dependencies) {
                if (Object.hasOwnProperty.call(dependencies, key)) {
                    const version = dependencies[key];
                    updates.push(dynamo.put(params(key, version)))
                }
            }

            await Promise.all(updates);

            return `${updates.length} dependencies published`
        }
    )
)