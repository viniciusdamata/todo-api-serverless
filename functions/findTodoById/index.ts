"use strict";
import AWS, { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type FindTodoByIdBody = {
  title: string;
  userId: string;
};

type Todo = {
  title: string;
  body: string;
  archived: boolean;
  backgroundColor: string;
  userId: string;
};

type FindTodoByIdResponse = {
  statusCode: number;
  body: Todo | null;
  error: string | null;
};

export const findTodoById = async ({
  title,
  userId,
}: FindTodoByIdBody): Promise<FindTodoByIdResponse> => {
  try {
    const IS_OFFLINE = process.env.IS_OFFLINE === "true" ? true : false;
    const decodedTitle = decodeURIComponent(title);

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

    const { Item } = await dynamoDbClient
      .get({
        TableName: TODOS_TABLE,
        Key: { title: decodedTitle },
      })
      .promise();

    if ((Item as Todo).userId !== userId) {
      return {
        statusCode: 401,
        body: null,
        error: "UnauthorizedError",
      };
    }

    return {
      statusCode: 200,
      body: Item as Todo,
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
