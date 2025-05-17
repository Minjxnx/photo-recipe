import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

interface RecipeCardProps {
  recipeText: string;
  index: number;
}

export function RecipeCard({ recipeText, index }: RecipeCardProps) {
  // Try to extract a title if the recipe text starts with "Title:" or similar pattern.
  // Otherwise, use a generic title.
  const titleMatch = recipeText.match(/^([^:\n]+):([\s\S]*)/);
  let title = `Suggestion ${index + 1}`;
  let content = recipeText;

  if (titleMatch && titleMatch[1].trim().length > 0 && titleMatch[1].trim().length < 80) {
    title = titleMatch[1].trim();
    content = titleMatch[2].trim();
     // If content after colon is empty, it means the original string was "Title:", so content should be empty.
    if (content === "") {
      // This case is fine, title is set, content is empty.
    }
  } else if (recipeText.length < 80 && !recipeText.includes('\n') && !recipeText.includes(':')) {
    // If the text is short, has no newlines, and no colon, treat the whole thing as a title-like suggestion.
    title = recipeText;
    content = ""; // No separate content if the whole string is the title
  }
  // If no match and not a short title-like string, 'title' remains "Suggestion X" and 'content' is 'recipeText'.

  return (
    <Card className="w-full shadow-lg break-inside-avoid bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
          <BookOpenText className="h-6 w-6 text-primary shrink-0" />
          {title}
        </CardTitle>
      </CardHeader>
      {content && (
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </CardContent>
      )}
    </Card>
  );
}
