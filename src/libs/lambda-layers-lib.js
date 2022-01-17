import * as lambda from "@aws-cdk/aws-lambda"

const collectorLayerName = "logzio-opentelemetry-collector-layer"
const collectorLayerArn =
    "arn:aws:lambda:eu-central-1:486140753397:layer:logzio-opentelemetry-collector-layer:1"
const tracerLayerName = "logzio-opentelemetry-nodejs-wrapper"
const tracerLayerArn =
    "arn:aws:lambda:eu-central-1:486140753397:layer:logzio-opentelemetry-nodejs-wrapper:1"

export const tracingLayerProps = (stack, prefix) => ({
    bundle: {
        externalModules: [collectorLayerName, tracerLayerName],
        copyFiles: [{ from: "common", to: "." }]
    },
    layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, prefix+"-"+collectorLayerName, collectorLayerArn),
        lambda.LayerVersion.fromLayerVersionArn(stack, prefix+"-"+tracerLayerName, tracerLayerArn),
    ],
})

export const tracingEnvProps = {
    AWS_LAMBDA_EXEC_WRAPPER: "/opt/otel-handler",
    OPENTELEMETRY_COLLECTOR_CONFIG_FILE: "/var/task/collector.yaml"
}