import { AWS } from "@serverless/typescript";

const cognitoUserPool: AWS["resources"] = {
  Resources: {
    CognitoUserPool: {
      Type: "AWS::Cognito::UserPool",
      //  Generate a name based on the stage
      Properties: {
        UserPoolName: "user-pool",
        // Set email as an alias
        UsernameAttributes: ["email"],
        AutoVerifiedAttributes: ["email"],
      },
    },
    CognitoUserPoolClient: {
      Type: "AWS::Cognito::UserPoolClient",
      Properties: {
        // Generate an app client name based on the stage
        ClientName: "user-pool-next-auth-client",
        UserPoolId: { Ref: "CognitoUserPool" },
        ExplicitAuthFlows: [
          "ALLOW_CUSTOM_AUTH",
          "ALLOW_USER_SRP_AUTH",
          "ALLOW_REFRESH_TOKEN_AUTH",
        ],
        GenerateSecret: true,
        AllowedOAuthFlows: ["code"],
        AllowedOAuthScopes: ["email", "openid", "profile"],
        CallbackURLs: [
          "http://localhost:3000",
          "http://localhost:3000/api/auth/callback/cognito",
        ],
        SupportedIdentityProviders: ["COGNITO"],
      },
    },
  },
  Outputs: {
    UserPoolId: { Value: { Ref: "CognitoUserPool" } },
    UserPoolClientId: { Value: { Ref: "CognitoUserPoolClient" } },
  },
};

export default cognitoUserPool;
