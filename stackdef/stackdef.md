## Todo list to create your stack

### In `/stacks` folder create the stack
  - [x] add API stack for `PUT /`
    - [x] add function definition for `create.js`
    - [x] add permissions for `create.js` to access `table`
    - [x] add permissions for `create.js` to access `dlq-queue`
  - [x] add table stack for `table`
    - [x] add function definition for `dbConsumer.js`
    - [x] add permissions for `dbConsumer.js` to access `topic`
    - [x] add permissions for `dbConsumer.js` to access `failover-queue`
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
    - [x] add update for `dlq-queue`
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