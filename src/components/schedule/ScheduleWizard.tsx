"use client";

import { OrderProvider, useOrder } from "@/lib/ordering/OrderContext";
import Progress from "@/components/schedule/Progress";
import CategoriesStep from "@/components/schedule/CategoriesStep";
import ItemsStep from "@/components/schedule/ItemsStep";
import LocationStep from "@/components/schedule/LocationStep";
import ScheduleStep from "@/components/schedule/ScheduleStep";
import ReviewStep from "@/components/schedule/ReviewStep";
import { formatCents } from "@/lib/money";

function WizardInner() {
  const { step, price } = useOrder();

  return (
    <div className="min-h-[70vh] bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {step === 0 ? (
          <p className="mb-8 text-center text-sm leading-relaxed text-muted">
            Payment is required to confirm your order.
          </p>
        ) : (
          <p className="mb-8 text-center text-sm leading-relaxed text-muted">
            Have your item details, pickup and delivery information, and contact information
            ready. Payment is required to confirm your order.
          </p>
        )}

        <Progress step={step} />

        {price && step > 0 && price.totalCents > 0 && (
          <p className="mt-5 text-center text-sm text-muted">
            Estimated total{" "}
            <span className="font-medium text-foreground">
              {formatCents(price.totalCents)}
            </span>
          </p>
        )}

        <div className="mt-10 rounded-sm border border-black/[0.06] bg-white px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-8 sm:py-10">
          {step === 0 && <CategoriesStep />}
          {step === 1 && <ItemsStep />}
          {step === 2 && <LocationStep kind="pickup" />}
          {step === 3 && <LocationStep kind="delivery" />}
          {step === 4 && <ScheduleStep />}
          {step === 5 && <ReviewStep />}
        </div>
      </div>
    </div>
  );
}

export default function ScheduleWizard() {
  return (
    <OrderProvider>
      <WizardInner />
    </OrderProvider>
  );
}
