// 'use server';

/**
 * @fileOverview Upsells product bundles and personalized discounts based on customer order patterns.
 *
 * - upsellProductBundles - A function that handles the upselling process.
 * - UpsellProductBundlesInput - The input type for the upsellProductBundles function.
 * - UpsellProductBundlesOutput - The return type for the upsellProductBundles function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpsellProductBundlesInputSchema = z.object({
  orderHistory: z
    .string()
    .describe(
      'A string containing the order history of the customer. Include product names, quantities, and dates of purchase.'
    ),
  currentCart: z
    .string()
    .describe(
      'A string containing the items currently in the customer cart.'
    ),
});
export type UpsellProductBundlesInput = z.infer<typeof UpsellProductBundlesInputSchema>;

const UpsellProductBundlesOutputSchema = z.object({
  suggestedBundles: z
    .string()
    .describe(
      'A list of suggested product bundles to offer the customer, based on their order history and current cart.'
    ),
  discountOffer: z
    .string()
    .describe(
      'A personalized discount offer to entice the customer to purchase the suggested bundles.'
    ),
});
export type UpsellProductBundlesOutput = z.infer<typeof UpsellProductBundlesOutputSchema>;

export async function upsellProductBundles(input: UpsellProductBundlesInput): Promise<UpsellProductBundlesOutput> {
  return upsellProductBundlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'upsellProductBundlesPrompt',
  input: {schema: UpsellProductBundlesInputSchema},
  output: {schema: UpsellProductBundlesOutputSchema},
  prompt: `You are an AI assistant helping a sales admin generate upsell offers for customers.

  Based on the customer's order history and current cart, suggest product bundles and a personalized discount offer.

  Order History: {{{orderHistory}}}
  Current Cart: {{{currentCart}}}

  Suggest product bundles that complement the items in the current cart and are relevant to the customer's past purchases.
  Craft a personalized discount offer to encourage the customer to purchase the suggested bundles.

  Format the output as follows:
  Suggested Bundles: [bundle suggestions]
  Discount Offer: [personalized discount offer]
  `,
});

const upsellProductBundlesFlow = ai.defineFlow(
  {
    name: 'upsellProductBundlesFlow',
    inputSchema: UpsellProductBundlesInputSchema,
    outputSchema: UpsellProductBundlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
