"use strict";
import AWS from "aws-sdk";
import DynamoDB, { DocumentClient } from "aws-sdk/clients/dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;

type RemoveTodoByIdBody = {
  title: string;
  userId: string;
};

type RemoveTodoByIdResponse = {
  statusCode: number;
  body: string | null;
  error: string | null;
};

export const removeTodoById = async ({
  title,
  userId,
}: RemoveTodoByIdBody): Promise<RemoveTodoByIdResponse> => {
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

    await dynamoDbClient
      .delete({
        TableName: TODOS_TABLE,
        Key: { title: decodedTitle },
        ConditionExpression: "userId=:userId",
        ExpressionAttributeValues: { ":userId": userId },
      })
      .promise();

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
