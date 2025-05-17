import type { RecipeDetail } from "@/ai/flows/suggest-recipes-from-photo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, ListChecks, CookingPot } from "lucide-react";

interface RecipeCardProps {
  recipe: RecipeDetail;
  index: number;
}

export function RecipeCard({ recipe, index }: RecipeCardProps) {
  const { title, ingredients, instructions } = recipe;

  return (
    <Card className="w-full shadow-lg break-inside-avoid bg-card text-card-foreground">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`item-${index}`}>
          <AccordionTrigger>
            <CardHeader className="p-4 flex-grow">
              <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                <BookOpenText className="h-6 w-6 text-primary shrink-0" />
                {title || `Suggestion ${index + 1}`}
              </CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 pt-0 space-y-4">
              {ingredients && ingredients.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-md mb-2 text-secondary-foreground">
                    <ListChecks className="h-5 w-5 text-secondary-foreground" />
                    Ingredients
                  </h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              {instructions && instructions.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-semibold text-md mb-2 text-secondary-foreground">
                    <CookingPot className="h-5 w-5 text-secondary-foreground" />
                    Instructions
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                    {instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {(!ingredients || ingredients.length === 0) &&
                (!instructions || instructions.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No detailed information available for this recipe.
                  </p>
                )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
