const env = {
    inputSchema: {}
}

export default {
    serviceName: "sst-test",
    functions: [
        {
            functionName: "create",
            functionDescription: "takes package.json file and creates, updates, delete db entries",
            inputSchema: env.inputSchema,
            apiEndpoint: {
                apiPath: "/",
                apiName: "put",
                apiMethod: "PUT",
                apiDecription: "public api with Basic Auth"
            },
            invokeEndpoints: ["invokeCreate", "invokeCreateAsync"],
            pubs: [
                {
                    pubType: "Table",
                    pubDescription: "db to store dependencies"
                },
                {
                    pubType: "Queue",
                    pubName: "dlq",
                    pubDescription: "dead letter queue for async calls"
                },
            ]
        },
        {
            functionName: "createAsync",
            functionDescription: "takes package.json file and async creates, updates, delete db entries",
            inputSchema: env.inputSchema,
            subs: [
                {
                    subType: "API",
                    subName: "/async",
                    subFilter: "PUT",
                }
            ],
            calls: [
                {
                    calledFunction: "create",
                    callDescription: "make async call to create function"
                },
            ],
        },
        {
            functionName: "authorizer",
            functionDescription: "do basic Auth check on public API calls",
            subs: [
                {
                    subType: "API",
                    subName: "/async",
                    subFilter: "PUT",
                },
                {
                    subType: "API",
                    subName: "/",
                    subFilter: "PUT",
                }

            ],
        },
        {
            functionName: "dbConsumer",
            functionDescription: "db stream to publish dep changes",
            subs: [
                { subType: "Table" }
            ],
            pubs: [
                {
                    pubType: "Topic",
                    pubDescription: "dep changes"
                }
            ]
        },
    ]
}