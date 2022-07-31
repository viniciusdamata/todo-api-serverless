import type { AWS } from "@serverless/typescript";
import { authorizer } from "../authorizer";

export const findTodoByIdDefinition: AWS["functions"] = {
  findTodoById: {
    handler: "./src/functions/findTodoById/index.findTodoById",
    events: [
      {
        http: {
          path: "todos/{Title}",
          method: "get",
          cors: true,
          integration: "lambda",
          request: {
            template: {
              "application/json": `
                  {
                    "title" : "$input.params('Title')",
                    "userId": "$context.authorizer.claims['cognito:username']"
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
                    "body": {
                          "title":"$inputRoot.body.title",
                          "body":"$inputRoot.body.body",
                          "archived":$inputRoot.body.archived,
                          "backgroundColor":"$inputRoot.body.backgroundColor",
                          "userId":"$inputRoot.body.userId"
                    },
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
