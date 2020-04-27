import stripePackage from "stripe";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.pageConfigTableName,
    Key: {
      id: event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item && result.Item.stripeKey) {
      const { amount, description, source } = JSON.parse(event.body);
      const stripe = stripePackage(result.Item.stripeKey);
      await stripe.charges.create({
        source,
        amount: Math.round(amount * 100),
        description,
        currency: "usd"
      });
      return success({ status: true });
    } else {
      return failure({ status: false, error: "Stripe key not found." });
    }
  } catch (error) {
    return failure({ status: false, error });
  }
}
