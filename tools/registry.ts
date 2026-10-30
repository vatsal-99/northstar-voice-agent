import { getOrderStatus } from "./get-order-status";
import { getProductDetails } from "./get-product-details";
import { listProducts } from "./list-products";
import { placeOrder } from "./place-order";
import type {
  ListProductsArgs,
  OrderStatusArgs,
  PlaceOrderArgs,
  ProductDetailsArgs,
  ToolResult,
} from "./types";

export const toolRegistry = {
  list_products: (args: ListProductsArgs) => listProducts(args),
  get_product_details: (args: ProductDetailsArgs) => getProductDetails(args),
  place_order: (args: PlaceOrderArgs) => placeOrder(args),
  get_order_status: (args: OrderStatusArgs) => getOrderStatus(args),
} satisfies Record<string, (args: never) => ToolResult>;
