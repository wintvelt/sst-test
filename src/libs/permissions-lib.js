import * as iam from "@aws-cdk/aws-iam";

export const generalPermissions = [
    new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        effect: iam.Effect.ALLOW,
        resources: [
            "*",
        ],
    }),
    new iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        effect: iam.Effect.ALLOW,
        resources: [
            "arn:aws:ssm:*:*:parameter/*"
        ],
    }),
]