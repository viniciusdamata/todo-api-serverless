import type { AWS } from "@serverless/typescript";
import { authorizer } from "../authorizer";

export const listTodosDefinition: AWS["functions"] = {
  listTodos: {
    handler: "./src/functions/listTodos/index.listTodos",
    events: [
      {
        http: {
          path: "todos",
          method: "get",
          cors: true,
          integration: "lambda",
          request: {
            template: {
              "application/json": `{
                "archived" : $input.params('archived'),
                "userId":"$context.authorizer.claims['cognito:username']"
                }`,
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
                "body": [
                  #foreach($elem in $inputRoot.body)
                  {
                      "title":"$elem.title",
                      "body":"$elem.body",
                      "archived":$elem.archived,
                      "backgroundColor":"$elem.backgroundColor",
                      "userId":"$elem.userId"
                  }
                  #if($foreach.hasNext),#end
                #end
                ],
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
