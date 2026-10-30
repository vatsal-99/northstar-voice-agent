import { Suspense } from "react";
import OrdersContent from "@/components/orders-content";

export default function OrdersPage() {
  return (
    <Suspense fallback={<main aria-label="Loading orders" />}>
      <OrdersContent />
    </Suspense>
  );
}
