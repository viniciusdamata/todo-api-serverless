import type { AWS } from "@serverless/typescript";
import { authorizer } from "../authorizer";

export const saveTodoDefinition: AWS["functions"] = {
  saveTodo: {
    handler: "./src/functions/saveTodo/index.saveTodo",
    events: [
      {
        http: {
          path: "todos",
          method: "post",
          cors: true,
          integration: "lambda",
          request: {
            template: {
              "application/json": `
                  #set($inputRoot = $input.path('$'))
                    {
                      "title": "$inputRoot.title",
                      "body": "$inputRoot.body",
                      "archived": $inputRoot.archived,
                      "backgroundColor":"$inputRoot.backgroundColor",
                      "userId":"$context.authorizer.claims['cognito:username']"
                    }`,
            },
          },
          response: {
            headers: {
              "Access-Control-Allow-Origin": "'*'",
              "Content-Type": "'application/json'",
            },
            template: `
                #set($inputRoot = $input.path('$'))
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
                template: `
                    #set($inputRoot = $input.path('$'))
                      {
                        "error" : "$inputRoot.error",
                        "body":$inputRoot.body,
                        "statusCode":$inputRoot.statusCode
                      }`,
              },
              500: {
                pattern: '.*"statusCode":500.*',
                template: `
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
