'use client';

import { useState, useEffect, startTransition, useCallback } from 'react';
import NextImage from 'next/image';
import { suggestRecipesFromPhoto, type SuggestRecipesFromPhotoOutput } from '@/ai/flows/suggest-recipes-from-photo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, ChefHat, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { RecipeCard } from '@/components/recipe-card';
import { Card, CardContent } from '@/components/ui/card';

export default function PhotoRecipePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recipesOutput, setRecipesOutput] = useState<SuggestRecipesFromPhotoOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setRecipesOutput(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      resetState();
    } else {
      setFile(null); // if user deselects file
      setPreviewUrl(null);
      resetState();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    resetState();
    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const photoDataUri = reader.result as string;
      startTransition(async () => {
        try {
          const output = await suggestRecipesFromPhoto({ photoDataUri });
          if (output.recipes && output.recipes.length > 0) {
            setRecipesOutput(output);
          } else {
            setError("No recipes found for the ingredients in the photo. Try a different image!");
          }
        } catch (e: any) {
          console.error("Error suggesting recipes:", e);
          setError(e.message || "Failed to suggest recipes. Please check the image or try again.");
        } finally {
          setIsLoading(false);
        }
      });
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.");
      setIsLoading(false);
    };
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 pt-8 sm:p-8 bg-background text-foreground">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ChefHat className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-primary">PhotoRecipe</h1>
        </div>
        <p className="text-muted-foreground">Upload a photo of your ingredients and discover delicious recipes!</p>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="photo-upload" className="block text-sm font-medium text-foreground mb-2">
                  Upload Ingredient Photo
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-border hover:border-primary bg-card hover:bg-muted transition-colors"
                  >
                    {previewUrl ? (
                      <NextImage src={previewUrl} alt="Preview" width={200} height={200} className="max-h-56 w-auto object-contain rounded-md" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        <div className="w-48 h-32 mt-2">
                           <NextImage src="https://placehold.co/300x200.png" alt="Placeholder for ingredients" layout="fill" objectFit="cover" className="rounded opacity-30" data-ai-hint="ingredients kitchen" />
                        </div>
                      </div>
                    )}
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                 {file && <p className="text-xs text-muted-foreground mt-2">Selected file: {file.name}</p>}
              </div>
              <Button type="submit" disabled={isLoading || !file} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Recipes...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Suggest Recipes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recipesOutput && recipesOutput.recipes.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-primary">Suggested Recipes</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-1"> {/* Changed to 1 column for better readability of recipes */}
              {recipesOutput.recipes.map((recipe, index) => (
                <RecipeCard key={index} recipeText={recipe} index={index} />
              ))}
            </div>
          </section>
        )}
         {isLoading && !recipesOutput && !error && (
          <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg shadow-md">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Our AI chef is thinking...</p>
            <p className="text-sm text-muted-foreground">Please wait while we cook up some recipe ideas!</p>
          </div>
        )}

      </main>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PhotoRecipe. All rights reserved.</p>
      </footer>
    </div>
  );
}
