export type StockStatus = "in_stock" | "out_of_stock";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stockStatus: StockStatus;
  deliveryEstimate: string;
  imageUrl: string;
};

export type ListProductsArgs = {
  keyword?: string;
  category?: string;
};

export type ProductDetailsArgs = {
  productId: string;
};

export type PlaceOrderArgs = {
  productId: string;
  quantity: number;
};

export type OrderStatusArgs = {
  orderNumber: string;
};

export type ToolResult =
  | {
      ok: true;
      data: unknown;
    }
  | {
      ok: false;
      error: string;
    };
