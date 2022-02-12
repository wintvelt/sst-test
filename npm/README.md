# Client package for sst-test

To install
```bash
  npm install @wintvelt/sst-test-client
```

This package exposes the following
## 1. Client functions to invoke lambda functions in the service directly

Example
```javascript
// example
import { invokeCreate, invokeCreateAsync } from '@wintvelt/sst-test-client'

event = {
    body: {
        ownerName: '[github owner]/[package name]',
        stage: 'prod', // or 'dev', other values are not allowed
        pack: package, // JSON parsed version of your package.json
    }
}

// async version returns in result: { statusCode: 200, statusText: "ok" }
const [error, result] = await invokeCreateAsync(event)
if (error) throw new Error(error)

// returns in result { statusCode: 200, message: "0 dependencies removed, 4 added, 0 updated, 0 unchanged" }
const [err, res] = await invokeCreate(event)
if (err) throw new Error(error)

```

## 2. AWS arns to add permissions to your stack to invoke
Arns for all relevant inputs and outputs will be made available.

Naming conventions apply:
- first key will be stage, do `dev` or `prod`
- for functions: `invoke[function name]Arn`, in camelCase, so e.g. `invokeCreateArn`

In this package, the following arns are available:
- `createArn` - for both sync as async invocation
- `dlqQueueArn`
- `topicArn`
- `failoverQueueArn`

In an example:
```javascript
import { arns } from '@wintvelt/sst-test-client'

// in your stack class:
      this.myApi.attachPermissions(
            lambdaPermissions(arns[process.env.stage].invokeCreateArn)
      )
```

## 3. urls of AWS endpoints
The following urls are exposed:
- `url` for all external access to API - GET /, PUT /, PUT /async
- `dlqQueueUrl` the url of the dead letter queue - for subscribing your lambda to the queue
- `failoverQueueUrl` the url of the failover queue of the db consumer - for subscribing your lambda to the queue

Also with versions per stage, as in example below
``` javascript
import { urls } from '@wintvelt/sst-test-client`

const url = urls.dev.url
const body = {
    ownerName: '[github owner]/[package name]',
    stage: 'prod', // or 'dev', other values are not allowed
    pack: package, // JSON parsed version of your package.json
}

let result
try {
    result = await axios.put(url, body, { headers: { Authorization } })
} catch(error) {
  ///
}
```

Requests to the REST APIs require an `Authorization: 'Basic [secret key]'` token in the headers.

Response format of `PUT` API is
```javascript
{
    statusCode: 200,
    message: "0 dependencies removed, 4 added, 0 updated, 0 unchanged" // or similar
}
```

The `PUT /async` API call will return simplified response
```javascript
{
    statusCode: 200,
    message: "ok" // signifies the request was received ok.
}
```
