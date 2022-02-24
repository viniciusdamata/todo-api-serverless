"use strict";
import AWS from "aws-sdk";

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
  const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
  try {
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
      statusCode: 200,
      body: "ok",
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
