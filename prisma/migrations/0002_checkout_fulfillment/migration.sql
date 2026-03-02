-- CreateTable
CREATE TABLE "CheckoutFulfillment" (
    "id" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripeEventId" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutFulfillment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutFulfillment_stripeCheckoutSessionId_key" ON "CheckoutFulfillment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "CheckoutFulfillment_userId_idx" ON "CheckoutFulfillment"("userId");

-- CreateIndex
CREATE INDEX "CheckoutFulfillment_productId_idx" ON "CheckoutFulfillment"("productId");

-- AddForeignKey
ALTER TABLE "CheckoutFulfillment" ADD CONSTRAINT "CheckoutFulfillment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutFulfillment" ADD CONSTRAINT "CheckoutFulfillment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
