import * as sst from "@serverless-stack/resources"
import * as cdk from "aws-cdk-lib"
import { HttpLambdaAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha"
import { DomainName } from "@aws-cdk/aws-apigatewayv2-alpha"

export default class ApiStack extends sst.Stack {
    // Public reference
    api
    apiFunctions
    queues
    topics
    buckets

    constructor(scope, id, props) {
        super(scope, id, props);

        // create the route components: queues, functions
        // TODO: topics
        this.queues = {
            "dlq-queue": new sst.Queue(this, "dlqQueue"),
        }
        this.apiFunctions = {}
        this.apiFunctions["create.js"] = new sst.Function(this, "create", {
            handler: "src/create.handler",
            environment: {
                STAGE: scope.stage,
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
                TABLE: props.table.tableName,
            },
            deadLetterQueue: this.queues["dlq-queue"].sqsQueue,
            permissions: [
                props.table,
            ],
        })
        this.apiFunctions["get.js"] = new sst.Function(this, "get", {
            handler: "src/get.handler",
            environment: {
                STAGE: scope.stage,
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
                TABLE: props.table.tableName,
            },
            permissions: [
                props.table,
            ],
        })
        this.apiFunctions["createAsync.js"] = new sst.Function(this, "createAsync", {
            handler: "src/createAsync.handler",
            environment: {
                STAGE: scope.stage,
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
                CREATE_FUNC: this.apiFunctions["create.js"].functionArn,
            },
            permissions: [
                this.apiFunctions["create.js"],
            ],
        })
        const authorizer = new sst.Function(this, "authorizer", {
            handler: "src/authorizer.handler",
            environment: {
                STAGE: scope.stage,
                AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1,
                SECRET_PUBLISH_TOKEN: process.env.SECRET_PUBLISH_TOKEN
            },
        })
        // Create the API
        this.api = new sst.Api(this, "api", {
            defaultAuthorizationType: sst.ApiAuthorizationType.CUSTOM,
            defaultAuthorizer: new HttpLambdaAuthorizer("authorizer", authorizer, {
                authorizerName: "LambdaAuthorizer",
                resultsCacheTtl: cdk.Duration.seconds(0) // turn off cache to prevent weird errors
            }),
            customDomain: {
                domainName: DomainName.fromDomainNameAttributes(this, "MyDomain", {
                    name: 'apiv2-dev.clubalmanac.com',
                }),
                path: 'depmanager'
            },
            routes: {
                "PUT /": this.apiFunctions["create.js"],
                "PUT /async": this.apiFunctions["createAsync.js"],
                "GET /": this.apiFunctions["get.js"],
            }
        });

        // add tags for autotrace lambda in lumigo, includes authorizers
        this.getAllFunctions().forEach(fn =>
            cdk.Tags.of(fn).add("lumigo:auto-trace", "true")
        )
        // for tracing of API in logz.io (lumigo misses gateway errors)
        cdk.Tags.of(this).add("logz:trace", "true")

        // add output to use in npm client
        const outputs = {
            "url": this.api.url,
            "customDomainUrl": this.api.customDomainUrl,
            "createArn": this.apiFunctions["create.js"].functionArn,
            "dlqQueueArn": this.queues["dlq-queue"].sqsQueue.queueArn,
            "dlqQueueUrl": this.queues["dlq-queue"].sqsQueue.queueUrl,
        }

        // Show the API endpoint in the output
        this.addOutputs(outputs);
    }
}