export type Verdict = "good" | "moderate" | "bad";

export type IngredientRating = "good" | "neutral" | "caution" | "avoid";

export interface RedFlag {
  name: string;
  note: string;
}

export interface IngredientEntry {
  name: string;
  rating: IngredientRating;
  note: string;
}

export interface Analysis {
  verdict: Verdict;
  summary: string;
  overallAssessment: string;
  redFlags: RedFlag[];
  addedSugar: string;
  ingredientBreakdown: IngredientEntry[];
  keyConcerns: string[];
  positives: string[];
  conclusion?: string;
  source: "migrated" | "haiku-4-5";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  ingredients: string;
  analysis: Analysis | null;
  analyzedAt: string | null;
}

export interface ProductsFile {
  generatedAt: string;
  products: Product[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
