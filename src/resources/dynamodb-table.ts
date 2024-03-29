import { AWS } from "@serverless/typescript";

const dynamodbTable: AWS["resources"] = {
  Resources: {
    todosTable: {
      Type: "AWS::DynamoDB::Table",
      Properties: {
        AttributeDefinitions: [
          {
            AttributeName: "title",
            AttributeType: "S",
          },
        ],
        KeySchema: [{ AttributeName: "title", KeyType: "HASH" }],
        TableName: "${self:custom.tableName}",
        BillingMode: "PAY_PER_REQUEST",
      },
    },
  },
};

export default dynamodbTable