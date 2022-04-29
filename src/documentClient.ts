import DynamoDB from "aws-sdk/clients/dynamodb";

export const DocumentClient = new DynamoDB.DocumentClient({
  convertEmptyValues: false,
});
