import * as iam from "@aws-cdk/aws-iam";

export const lambdaPermissions = (arn) => [
    new iam.PolicyStatement({
        actions: [
            "lambda:InvokeFunction",
            "lambda:InvokeAsync"
        ],
        effect: iam.Effect.ALLOW,
        resources: [
            arn,
        ],
    }),
]