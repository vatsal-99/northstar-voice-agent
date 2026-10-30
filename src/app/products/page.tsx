import ProductCatalogue from "@/components/product-catalogue";
import { catalog } from "../../../tools/catalog";

export default function ProductsPage() {
  return <ProductCatalogue products={catalog} />;
}
