import catalogData from "./catalog.json";
import type { Product } from "./types";

export const catalog = catalogData as Product[];

export function findProduct(productId: string): Product | undefined {
  return catalog.find((product) => product.id === productId);
}
