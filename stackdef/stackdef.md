## Todo list to create your stack

### In `/stacks` folder create the stack
  - [ ] add API stack for `PUT /`
    - [ ] add function definition for `create.js`
    - [ ] add permissions for `create.js` to access `table`
    - [ ] add permissions for `create.js` to access `dlq-queue`
  - [ ] add table stack for `table`
    - [ ] add function definition for `dbConsumer.js`
    - [ ] add permissions for `dbConsumer.js` to access `topic`
    - [ ] add permissions for `dbConsumer.js` to access `failover-queue`
  - [ ] add queue stack for `dlq-queue`
  - [ ] add API stack for `PUT /async`
    - [ ] add function definition for `createAsync.js`
    - [ ] add permissions for `createAsync.js` to access `create.js`
  - [ ] add API stack for `GET /`
    - [ ] add function definition for `authorizer.js`
    - [ ] add function definition for `get.js`
    - [ ] add permissions for `get.js` to access `table`
  - [ ] add topic stack for `topic`
  - [ ] add queue stack for `failover-queue`

### In `/src` folder create the handler functions
  - [ ] create `create.js` handler
    - [ ] add update for `table`
    - [ ] add update for `dlq-queue`
  - [ ] create `createAsync.js` handler
    - [ ] add update for `create.js`
  - [ ] create `authorizer.js` handler
  - [ ] create `dbConsumer.js` handler
    - [ ] add update for `topic`
    - [ ] add update for `failover-queue`
  - [ ] create `get.js` handler
    - [ ] add query of `table`

### In `/npm` folder expose functions and arn info for client
  - [ ] expose arn for queue `dlq-queue`
  - [ ] expose arn for queue `failover-queue`
  - [ ] expose arn of `create.js` for permission to invoke function `invokeCreate.js`
  - [ ] expose arn of `create.js` for permission to invoke function `invokeCreateAsync.js`
  - [ ] expose function `invokeCreate.js` to invoke `create.js`
  - [ ] expose function `invokeCreateAsync.js` to invoke `create.js`
  - [ ] expose url endpoint for API `GET /`
  - [ ] expose url endpoint for API `PUT /`
  - [ ] expose url endpoint for API `PUT /async`
  - [ ] expose url endpoint for queue `dlq-queue`
  - [ ] expose url endpoint for queue `failover-queue`