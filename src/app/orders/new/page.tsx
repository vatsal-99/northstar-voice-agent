import { Suspense } from "react";
import OrdersContent from "@/components/orders-content";

export default function NewOrderPage() {
  return (
    <Suspense fallback={<main aria-label="Loading new order" />}>
      <OrdersContent />
    </Suspense>
  );
}
