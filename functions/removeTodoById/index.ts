"use strict";
import AWS from "aws-sdk";
import DynamoDB, {
  DeleteItemInput,
  DocumentClient,
} from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type RemoveTodoByIdBody = {
  title: string;
};

type RemoveTodoByIdResponse = {
  statusCode: number;
  body: string | null;
  error: string | null;
};

export const removeTodoById = async ({
  title,
}: RemoveTodoByIdBody): Promise<RemoveTodoByIdResponse> => {
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
    const params = {
      TableName: TODOS_TABLE,
      Key: { title },
    };

    await dynamoDbClient.delete(params).promise();

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
