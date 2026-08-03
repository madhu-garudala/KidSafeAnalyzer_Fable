import "server-only";
import data from "@/data/products.json";
import type { Product, ProductsFile, Verdict } from "./types";

const file = data as unknown as ProductsFile;

export interface SlimProduct {
  id: string;
  name: string;
  category: string;
  verdict: Verdict | null;
  summary: string;
}

export function getProducts(): Product[] {
  return file.products;
}

export function getProduct(id: string): Product | undefined {
  return file.products.find((p) => p.id === id);
}

export function getSlimIndex(): SlimProduct[] {
  return file.products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    verdict: p.analysis?.verdict ?? null,
    summary: p.analysis?.summary ?? "",
  }));
}

export function getCategories(): string[] {
  return [...new Set(file.products.map((p) => p.category))].sort();
}
