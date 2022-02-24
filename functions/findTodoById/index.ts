"use strict";
import AWS from "aws-sdk";

const TODOS_TABLE = process.env.TODOS_TABLE;

type FindTodoByIdBody = {
  title: string;
};

type FindTodoByIdResponse = {
  statusCode: number;
  body: string | null;
  error: string | null;
};

export const findTodoById = async ({
  title,
}: FindTodoByIdBody): Promise<FindTodoByIdResponse> => {
  const dynamoDbClient = new AWS.DynamoDB.DocumentClient();
  try {
    if (!TODOS_TABLE) {
      throw new Error("Provide todos table env");
    }
    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: TODOS_TABLE,
      Key: { title },
    };

    const { Item } = await dynamoDbClient.get(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(Item),
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
