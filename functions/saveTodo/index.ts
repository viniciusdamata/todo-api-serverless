"use strict";
import AWS from "aws-sdk";
import DynamoDB, { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type SaveTodoBody = {
  title: string;
  body: string;
  archived: boolean;
  backgroundColor: string;
  userId: string;
};

type SaveTodoResponse = {
  statusCode: number;
  body: string | null;
  error: string | null;
};

export const saveTodo = async (
  event: SaveTodoBody
): Promise<SaveTodoResponse> => {
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
    const params = {
      TableName: TODOS_TABLE,
      Item: {
        title: event.title,
        body: event.body,
        archived: false,
        backgroundColor: event.backgroundColor,
        userId: event.userId,
      },
    };

    await dynamoDbClient.put(params).promise();

    return {
      statusCode: 201,
      body: "created",
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
