'use server';
/**
 * @fileOverview Suggests recipes based on a photo of ingredients.
 *
 * - suggestRecipesFromPhoto - A function that suggests recipes based on a photo.
 * - SuggestRecipesFromPhotoInput - The input type for the suggestRecipesFromPhoto function.
 * - SuggestRecipesFromPhotoOutput - The return type for the suggestRecipesFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestRecipesFromPhotoInput = z.infer<
  typeof SuggestRecipesFromPhotoInputSchema
>;

const SuggestRecipesFromPhotoOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('An array of possible recipes that can be made from the ingredients in the photo.'),
});
export type SuggestRecipesFromPhotoOutput = z.infer<
  typeof SuggestRecipesFromPhotoOutputSchema
>;

export async function suggestRecipesFromPhoto(
  input: SuggestRecipesFromPhotoInput
): Promise<SuggestRecipesFromPhotoOutput> {
  return suggestRecipesFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesFromPhotoPrompt',
  input: {schema: SuggestRecipesFromPhotoInputSchema},
  output: {schema: SuggestRecipesFromPhotoOutputSchema},
  prompt: `You are a world-class chef, skilled at identifying ingredients and suggesting recipes.

  Based on the following photo of ingredients, suggest a list of possible recipes that can be made.  Focus on recipes that highlight the ingredients in the photo.

  Photo: {{media url=photoDataUri}}
  Recipes:`, // TODO: Add example recipes
});

const suggestRecipesFromPhotoFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFromPhotoFlow',
    inputSchema: SuggestRecipesFromPhotoInputSchema,
    outputSchema: SuggestRecipesFromPhotoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
