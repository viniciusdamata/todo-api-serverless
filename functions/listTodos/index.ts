"use strict";
import AWS, { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type ListTodoBody = {
  archived: boolean;
};

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

export const listTodos = async (
  { archived }: ListTodoBody = {
    archived: false,
  }
): Promise<ListTodoResponse> => {
  try {
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
    if (!TODOS_TABLE) {
      throw new Error("Provide todos table env");
    }
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: TODOS_TABLE,
      Select: "ALL_ATTRIBUTES",
      FilterExpression: "archived=:archived",
      ExpressionAttributeValues: {
        ":archived": archived,
      },
    };

    const { Items } = await dynamoDbClient.scan(params).promise();
    return {
      statusCode: 200,
      body: Items as Todo[],
      error: null,
    };
  } catch (err: any) {
    console.log(err);
    return {
      statusCode: 500,
      body: null,
      error: err.message,
    };
  }
};
