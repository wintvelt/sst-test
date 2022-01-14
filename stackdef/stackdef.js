module.exports = {
    serviceName: "sst-test",
    nodes: [
        {
            name: "create.js",
            pubs: ["table", "dlq-queue"],
            subs: ["PUT /"]
        },
        {
            name: "createAsync.js",
            subs: ["PUT /async"],
            pubs: [
                { name: "create.js", async: true },
            ],
        },
        {
            name: "authorizer.js",
            type: "function",
            subs: [
                { name: "GET /" },
                { name: "PUT /" },
                { name: "PUT /async" },
            ]
        },
        {
            name: "dbConsumer.js",
            subs: ["table"],
            pubs: [{ name: "topic" }]
        },
        {
            name: "get.js",
            subs: ["GET /"],
            queries: ["table"],
        },
        { name: "invokeCreate.js", cluster: "input", pubs: ["create.js"] },
        {
            name: "invokeCreateAsync.js", cluster: "input",
            pubs: [{ name: "create.js", async: true }]
        },
    ]
}