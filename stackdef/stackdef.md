## Todo list to create your stack

### In `/stacks` folder create the stack
  - [x] add API stack for `PUT /`
    - [x] add function definition for `create.js`
    - [x] add permissions for `create.js` to access `table`
    - [x] add `dlq-queue` as dlq/ failover for `create.js`
  - [x] add table stack for `table`
    - [x] add function definition for `dbConsumer.js`
    - [x] add permissions for `dbConsumer.js` to access `topic`
    - [x] add `failover-queue` as dlq/ failover for `dbConsumer.js`
  - [x] add queue stack for `dlq-queue`
  - [x] add API stack for `PUT /async`
    - [x] add function definition for `createAsync.js`
    - [x] add permissions for `createAsync.js` to access `create.js`
  - [x] add API stack for `GET /`
    - [x] add function definition for `authorizer.js`
    - [x] add function definition for `get.js`
    - [x] add permissions for `get.js` to access `table`
  - [x] add topic stack for `topic`
  - [x] add queue stack for `failover-queue`

### In `/src` folder create the handler functions
  - [x] create `create.js` handler
    - [x] add update for `table`
  - [x] create `createAsync.js` handler
    - [x] add update for `create.js`
  - [x] create `authorizer.js` handler
  - [x] create `dbConsumer.js` handler
    - [x] add update for `topic`
  - [x] create `get.js` handler
    - [x] add query of `table`

### In `/npm` folder expose functions and arn info for client
  - [x] expose arn for queue `dlq-queue`
  - [x] expose arn for queue `failover-queue`
  - [x] expose arn of `create.js` for permission to invoke function `invokeCreate.js`
  - [x] expose arn of `create.js` for permission to invoke function `invokeCreateAsync.js`
  - [x] expose function `invokeCreate.js` to invoke `create.js`
  - [x] expose function `invokeCreateAsync.js` to invoke `create.js`
  - [x] expose url endpoint for API `GET /`
  - [x] expose url endpoint for API `PUT /`
  - [x] expose url endpoint for API `PUT /async`
  - [x] expose url endpoint for queue `dlq-queue`
  - [x] expose url endpoint for queue `failover-queue`