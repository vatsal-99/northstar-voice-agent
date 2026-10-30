import Storefront from "@/components/storefront";
import { catalog } from "../../tools/catalog";

export default function Home() {
  return <Storefront products={catalog} />;
}
