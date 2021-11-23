# Dependency publication service

to install
```
npm install @wintvelt/sst-test
```

## Client
For this service, default usage is through the API endpoints.

But functions are also exposed.
Per standard, all functions in client will expect `process.env.STAGE` to be set (to either prod or dev)

Functions can be imported like this
```javascript
import { invokeCreate, invokeCreateAsync } from '@wintvelt/sst-test-client/functions'
```

`invokeCreate(event)` will directly publish the dependencies, allowing to read the changes applied.

`invokeCreateAsync(event)` will asynchronously publish the dependencies, by calling create lambda async.

The input schema for the event (to be passed as parameter) to both functions is
```javascript
{
    type: 'object',
    properties: {
        body: {
            type: 'object',
            properties: {
                ownerName: { type: 'string', pattern: '.+/{1}.+' }, // string with 1 slash
                stage: { type: 'string', enum: ['prod', 'dev'] },
                pack: { type: 'object' },
            },
            required: ['ownerName', 'stage', 'pack']
        }
    }
}
```

In an example:
```javascript
const myEvent = {
    body: {
        ownerName: 'wintvelt/npm-create-async-test',
        stage: 'dev',
        pack: { dependencies: { 'async-dep': '0.0.1' } },
    }
}

const result = await createInvoke(myEvent)
```

The stack invokes these functions will need permissions set. Both functions need access to the `put` function arn. Both functions invoke the same lambda.
- `invokeCreate()` does a synchronous call
- `invokeCreateAsync()` does a asynchronous call

```javascript
import arns from '@wintvelt/spqr-albums-client/arns'
import { lambdaPermissions } from "../src/libs/permissions-lib";

const arnWeNeedAccessTo = arns.put[process.env.STAGE]

this.myFunction.attachPermissions(lambdaPermissions(arnWeNeedAccessTo))
```

## API
All API endpoints require `Authorization: Basic (your-secret-token)` header to be included in format

In addition, endpoints are heavily throttled. But should not cause problems, because expected invocation frequency is low per account/ project: only on each push/ deploy.

The endpoints urls are included in the package `apiEndpoints`, and can be used like this
```javascript
import urls from '@wintvelt/sst-test-client/apiEndpoints'

const getUrl = urls.get.dev // to get the endpoint to the dev stage endpoint for GET method
```

The following APIs are exposed.
- `urls.get[stage]` to be used for both getting list and for getting dependency records for indivual package.
- `urls.put[stage]`
- `urls.putAsync[stage]`


### `GET /`
Returns list of all [stage-packages] in database who published dependencies. Can be useful to collect the complete contents of the database, by using these ids to perform individual get requests for each.
```json
[ "[stage]-[package name]" ]
```

### `GET /?id=[package name]`
Package name should be encoded as search parameter (to escape weird characters), e.g. like this:
```javascript
const dependency = "@middy/core"
const searchParam = new URLSearchParams({ id: dependency }).toString()
const url = baseurl + '/?' + searchParam
```

Returns all packages that have `[package name]` as dependency, in a list
```json
[
    { 
        "packageStage": "[stage]-[subscriber package]",
        "dependency": "[package name from request]",
        "createdAt": 1636151395685,
        "version": "^1.126.0"
    }
]
```
### `PUT /`
Updates dependencies from a `package.json` file.
Request body must be
```javascript
{ 
    "ownerName": "[owner]/[package name]",
    "stage": "dev|prod", // other values not allowed, will return error
    "pack": {}, // object with package.json contents
}
```

Response includes
```javascript
data: {
    result: 'success',
    message: '1 dependencies removed, 1 added, 1 updated, 1 unchanged'
}
```

### `PUT /async`
Updates dependencies from a `package.json` file asynchronously
Request body must be
```javascript
{ 
    "ownerName": "[owner]/[package name]",
    "stage": "dev|prod", // other values not allowed, will return error
    "pack": {}, // object with package.json contents
}
```

API will return a simple result in the shape:
```javascript
{
    status: 200, // status code is 200 if request is posted successfully
    statusText: "" // empty by default
}
```


## Published event topics
(none yet)

## Published queues for external commands
(only exposed via async API endpoint and async function)

## Subscription to external event topics
(none)