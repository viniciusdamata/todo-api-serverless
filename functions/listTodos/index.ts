"use strict";
import AWS, { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type ListTodoBody = {
  archived: boolean;
  userId: string;
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

export const listTodos = async ({
  userId,
  archived = false,
}: ListTodoBody): Promise<ListTodoResponse> => {
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

    const { Items } = await dynamoDbClient
      .scan({
        TableName: TODOS_TABLE,
        Select: "ALL_ATTRIBUTES",
        FilterExpression: "archived=:archived and userId=:userId",
        ExpressionAttributeValues: {
          ":archived": archived,
          ":userId": userId,
        },
      })
      .promise();
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
