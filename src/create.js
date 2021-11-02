// main handler function
import { handler } from "./libs/handler";
import { dynamo } from "./libs/dynamo-lib";

// validate header before processing
const validator = (lambda => {
    return async function (event, context) {
        if (event.headers?.Authorization !== process.env.SECRET_TOKEN) {
            return {
                statusCode: 402,
                message: "Forbidden"
            }
        }
        if (!event.body) {
            return {
                statusCode: 403,
                message: "Bad request"
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
            const { name, stage, pack } = event.body;
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
                dependencies = {...pack.dependencies}
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