import { notFound } from "next/navigation";
import { catalog, findProduct } from "../../../../tools/catalog";
import ProductDetail from "@/components/product-detail";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export function generateStaticParams() {
  return catalog.map((product) => ({ productId: product.id }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = findProduct(productId);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
