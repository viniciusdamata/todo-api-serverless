import type { AWS } from "@serverless/typescript";
import cognitoUserPool from "./src/resources/cognito-user-pool";
import dynamodbTable from "./src/resources/dynamodb-table";
import { findTodoByIdDefinition } from "./src/resources/functions/findTodoById";
import { listTodosDefinition } from "./src/resources/functions/listTodos";
import { removeTodoByIdDefinition } from "./src/resources/functions/removeTodoById";
import { saveTodoDefinition } from "./src/resources/functions/saveTodo";

const serverlessConfiguration: AWS = {
  service: "todo-api",
  frameworkVersion: "3",
  variablesResolutionMode: "20210326",
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    memorySize: 128,
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [{ "Fn::GetAtt": ["todosTable", "Arn"] }],
          },
        ],
      },
    },
    environment: {
      TODOS_TABLE: "${self:custom.tableName}",
    },
  },
  custom: {
    tableName: "todos-table-${sls:stage}",
    esbuild: {
      bundle: true,
      minify: true,
      watch: { pattern: ["functions/**/*.ts"] },
    },
    dynamodb: {
      stages: ["dev"],
      start: {
        port: 8000,
        inMemory: true,
        heapInitial: "200m",
        heapMax: "1g",
        migrate: true,
        seed: true,
        convertEmptyValues: true,
      },
    },
    "serverless-offline": { resourceRoutes: true },
  },
  resources: {
    Resources: { ...cognitoUserPool?.Resources, ...dynamodbTable?.Resources },
    Outputs: {
      ...cognitoUserPool?.Outputs,
    },
  },
  functions: {
    ...saveTodoDefinition,
    ...findTodoByIdDefinition,
    ...listTodosDefinition,
    ...removeTodoByIdDefinition
  },
  plugins: [
    "serverless-dynamodb-local",
    "serverless-esbuild",
    "serverless-offline",
  ],
  package: {
    individually: true,
    exclude: ["node_modules/**", "package.json", "package-lock.json"],
  },
};

module.exports = serverlessConfiguration;
