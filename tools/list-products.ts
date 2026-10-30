import { catalog } from "./catalog";
import { logToolCall } from "./logger";
import type { ListProductsArgs, Product, ToolResult } from "./types";

export function listProducts(args: ListProductsArgs = {}): ToolResult {
  const keyword = args.keyword?.trim().toLowerCase();
  const category = args.category?.trim().toLowerCase();

  const products = catalog.filter((product) => {
    const matchesKeyword =
      !keyword ||
      [product.name, product.description, product.category].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    const matchesCategory =
      !category || product.category.toLowerCase() === category;
    return matchesKeyword && matchesCategory;
  });

  const result = {
    ok: true as const,
    data: {
      products: products.map(toSummary),
      count: products.length,
    },
  };
  logToolCall("list_products", args, result);
  return result;
}

function toSummary(product: Product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    currency: product.currency,
    stockStatus: product.stockStatus,
  };
}
