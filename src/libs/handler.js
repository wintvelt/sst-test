// generic handler to parse body and catch general errors
const response = (statusCode, content) => {
    if (statusCode <= 299) {
        return ({
            statusCode,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
            body: JSON.stringify(content),
        });
    }
    // otherwise, it is an error
    return ({
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        message: content,
    });

}

export const handler = (lambda) => {
    return async function (event, context) {
        // parse event
        let parsedEvent = event;
        let result;
        try {
            if (event.body) {
                const body = JSON.parse(event.body)
                parsedEvent = { ...event, body }
            }
        } catch (error) {
            // Bad request
            return response(403, error.message)
        }

        // run the lambda
        try {
            result = lambda(event, context)
        } catch (error) {
            // some internal error
            return response(500, error.message)
        }

        // return the result
        return response(200, result)
    }
}