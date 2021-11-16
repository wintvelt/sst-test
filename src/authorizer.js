// A simple token-based authorizer based on simple token
// If 'unauthorized' or an empty string, returns an HTTP 401 status code. 
// For any other token value returns an HTTP 500 status code. 
// Note that token values are case-sensitive.

export function handler (event, context, callback) {
    let token = event.headers?.authorization

    switch (token) {
        case `Basic ${process.env.SECRET_PUBLISH_TOKEN}`:
            callback(null, generatePolicy('user', 'Allow', event.methodArn));
            break;
        default:
            console.log({token})
            console.log(process.env.SECRET_PUBLISH_TOKEN)
            console.log(`Basic ${process.env.SECRET_PUBLISH_TOKEN}` === token)
            callback("Unauthorized");   // Return a 401 Unauthorized response
            break;
    }
}

// Help function to generate an IAM policy
const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    return authResponse;
}