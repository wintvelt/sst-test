import * as lambda from "@aws-cdk/aws-lambda"

const layerName = "logzio-opentelemetry-collector-layer"
const layerArn =
    "arn:aws:lambda:eu-central-1:486140753397:layer:logzio-opentelemetry-collector-layer:1"

export const layerProps = (stack, name) => ({
    bundle: {
        externalModules: [layerName],
        copyFiles: [{ from: "common", to: "." }]
    },
    layers: [
        lambda.LayerVersion.fromLayerVersionArn(stack, name, layerArn),
    ],
})