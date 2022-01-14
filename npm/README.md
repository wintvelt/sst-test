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
import { invokeCreate, invokeCreateAsync } from '@wintvelt/sst-test-client/functions'

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
Each arn has a `dev` and `prod` version.
- `put` needed for the `invokeCreate` function
- `putAsync` needed for the `invokeCreateAsync` function
- `dlq` needed to access the dead letter queue output - to subscribe your service to the queue

In an example:
```javascript
import { put, putAsync, dlq } from '@wintvelt/sst-test-client/arns'

// in your stack class:
      this.myApi.attachPermissions(
            lambdaPermissions(put[process.env.stage])
      )
```

## 3. urls of AWS endpoints
The following urls are exposed:
- `get` for external access to the GET REST API
- `put` for external access to the REST API for synchronous invocation
- `putAsync` for external access to the REST API for async invocation 
- `dlq` the url of the dead letter queue - for subscribing your lambda to the queue

Also with versions per stage, as in example below
``` javascript
import urls from '@wintvelt/sst-test-client/urls'

const url = urls.put.dev
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

Response format of `put` API is
```javascript
{
    statusCode: 200,
    message: "0 dependencies removed, 4 added, 0 updated, 0 unchanged" // or similar
}
```

The `putAsync` API call will return simplified response
```javascript
{
    statusCode: 200,
    message: "ok" // signifies the request was received ok.
}
```
