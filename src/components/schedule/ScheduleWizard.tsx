"use client";

import { OrderProvider, useOrder } from "@/lib/ordering/OrderContext";
import Progress from "@/components/schedule/Progress";
import ItemsStep from "@/components/schedule/ItemsStep";
import PickupStep from "@/components/schedule/PickupStep";
import LocationStep from "@/components/schedule/LocationStep";
import ReviewStep from "@/components/schedule/ReviewStep";

function WizardInner() {
  const { step } = useOrder();

  return (
    <div className="min-h-[70vh] bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <Progress step={step} />

        <div className="mt-10 rounded-sm border border-black/[0.06] bg-white px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-8 sm:py-10">
          {step === 0 && <ItemsStep />}
          {step === 1 && <PickupStep />}
          {step === 2 && <LocationStep />}
          {step === 3 && <ReviewStep />}
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
