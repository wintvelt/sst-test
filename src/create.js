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
        (event) => {
            // Get data from event body
            const { name, stage, pack } = event.body;

            const params = {
                TableName: process.env.TABLE_NAME,
                Item: {
                    packageStage: `${stage}-${name}`,
                    dependency: pack,
                    createdAt: Date.now(),
                },
            };

            await dynamo.put(params);
            return params.Item
        }
    )
)