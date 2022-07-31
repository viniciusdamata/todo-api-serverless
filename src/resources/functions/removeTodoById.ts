import type { AWS } from "@serverless/typescript";
import { authorizer } from "../authorizer";

export const removeTodoByIdDefinition: AWS["functions"] = {
  removeTodoById: {
    handler: "./src/functions/removeTodoById/index.removeTodoById",
    events: [
      {
        http: {
          path: "todos/{Title}",
          method: "delete",
          cors: true,
          integration: "lambda",
          request: {
            template: {
              "application/json": `
                  {
                    "title" : "$input.params('Title')",
                    "userId":"$context.authorizer.claims['cognito:username']"
                  }
              `,
            },
          },
          response: {
            headers: {
              "Access-Control-Allow-Origin": "'*'",
              "Content-Type": "'application/json'",
            },
            template: `#set($inputRoot = $input.path('$'))
            {
                "error":"$inputRoot.error",
                "body": "$inputRoot.body",
                "statusCode":$inputRoot.statusCode
            }`,
            statusCodes: {
              200: {
                pattern: "",
              },
              400: {
                pattern: '.*"statusCode":400.*',
                template: `>
                    #set($inputRoot = $input.path('$'))
                      {
                        "error" : "$inputRoot.error",
                        "body":$inputRoot.body,
                        "statusCode":$inputRoot.statusCode
                      }`,
              },
              500: {
                pattern: '.*"statusCode":500.*',
                template: `>
                    #set($inputRoot = $input.path('$'))
                      {
                        "error" : "$inputRoot.error",
                        "body":$inputRoot.body,
                        "statusCode":$inputRoot.statusCode
                      }`,
                headers: {
                  "Content-Type": "'application/json'",
                },
              },
            },
          },
          authorizer,
        },
      },
    ],
  },
};
