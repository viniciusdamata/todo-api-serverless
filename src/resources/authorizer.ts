export const authorizer = {
  type: "COGNITO_USER_POOLS",
  name: "user-pool",
  arn: {"Fn::GetAtt" : [ "CognitoUserPool", "Arn" ]},
};
