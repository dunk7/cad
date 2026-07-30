-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "pickupJson" TEXT NOT NULL,
    "deliveryJson" TEXT NOT NULL,
    "itemsJson" TEXT NOT NULL,
    "scheduleJson" TEXT NOT NULL,
    "pricingJson" TEXT NOT NULL,
    "alertsJson" TEXT NOT NULL DEFAULT '[]',
    "declaredValueCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "termsAcceptedAt" DATETIME,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paymentMethod" TEXT,
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "pricingJson" TEXT NOT NULL,
    "routesJson" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
