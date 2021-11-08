// input validation schema for create.js, createAsync.js and queueConsumer.js
export const inputSchema = {
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                ownerName: { type: 'string', pattern: '.+/{1}.+' }, // string with 1 slash
                stage: { type: 'string', enum: ['prod', 'dev'] },
            },
            required: ['ownerName', 'stage']
        }
    }
}