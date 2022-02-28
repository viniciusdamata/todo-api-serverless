"use strict";
import AWS, { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type ListTodoBody = {};

type Todo = {
  title: string;
  body: string;
  archived: boolean;
  backgroundColor: string;
  userId: string;
};

type ListTodoResponse = {
  statusCode: number;
  body: Todo[] | null;
  error: string | null;
};

export const listTodos =
  async ({}: ListTodoBody): Promise<ListTodoResponse> => {
    const IS_OFFLINE = process.env.IS_OFFLINE === "true" ? true : false;

    const dynamoDbOptions:
      | (DocumentClient.DocumentClientOptions &
          DynamoDB.Types.ClientConfiguration)
      | undefined = IS_OFFLINE
      ? {
          endpoint: "http://localhost:8000",
          region: "localhost",
        }
      : undefined;

    const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbOptions);
    try {
      if (!TODOS_TABLE) {
        throw new Error("Provide todos table env");
      }
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: TODOS_TABLE,
        Select: "ALL_ATTRIBUTES",
      };

      const { Items } = await dynamoDbClient.scan(params).promise();
      console.log(Items);
      return {
        statusCode: 200,
        body: Items as Todo[],
        error: null,
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        body: null,
        error: err.message,
      };
    }
  };
