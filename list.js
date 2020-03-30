import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.pageConfigTableName,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    const sortedItems = result.Items.sort((a, b) => {
      if (a.itemType < b.itemType) return -1;
      if (b.itemType < a.itemType) return 1;
      return 0;
    });
    return success(sortedItems);
  } catch (error) {
    return failure({ status: false, error });
  }
}
