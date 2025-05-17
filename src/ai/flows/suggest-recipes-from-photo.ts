"use server";
/**
 * @fileOverview Suggests recipes based on a photo of ingredients.
 *
 * - suggestRecipesFromPhoto - A function that suggests recipes based on a photo.
 * - SuggestRecipesFromPhotoInput - The input type for the suggestRecipesFromPhoto function.
 * - SuggestRecipesFromPhotoOutput - The return type for the suggestRecipesFromPhoto function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SuggestRecipesFromPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
});
export type SuggestRecipesFromPhotoInput = z.infer<
  typeof SuggestRecipesFromPhotoInputSchema
>;

const RecipeDetailSchema = z.object({
  title: z.string().describe("The title of the recipe."),
  ingredients: z
    .array(z.string())
    .describe("A list of ingredients for the recipe."),
  instructions: z
    .array(z.string())
    .describe("Step-by-step instructions for preparing the recipe."),
});
export type RecipeDetail = z.infer<typeof RecipeDetailSchema>;

const SuggestRecipesFromPhotoOutputSchema = z.object({
  recipes: z
    .array(RecipeDetailSchema)
    .describe(
      "An array of possible recipes, each with a title, ingredients, and instructions.",
    ),
});
export type SuggestRecipesFromPhotoOutput = z.infer<
  typeof SuggestRecipesFromPhotoOutputSchema
>;

export async function suggestRecipesFromPhoto(
  input: SuggestRecipesFromPhotoInput,
): Promise<SuggestRecipesFromPhotoOutput> {
  return suggestRecipesFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: "suggestRecipesFromPhotoPrompt",
  input: { schema: SuggestRecipesFromPhotoInputSchema },
  output: { schema: SuggestRecipesFromPhotoOutputSchema },
  prompt: `You are a world-class chef, skilled at identifying ingredients and suggesting recipes.

  Based on the following photo of ingredients, suggest a list of possible recipes that can be made. For each recipe, provide a clear title, a list of ingredients, and step-by-step instructions. Focus on recipes that highlight the ingredients in the photo.

  Photo: {{media url=photoDataUri}}
  Recipes:`,
});

const suggestRecipesFromPhotoFlow = ai.defineFlow(
  {
    name: "suggestRecipesFromPhotoFlow",
    inputSchema: SuggestRecipesFromPhotoInputSchema,
    outputSchema: SuggestRecipesFromPhotoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Ensure recipes is always an array, even if the LLM returns null or undefined for it.
    return { recipes: output?.recipes || [] };
  },
);
