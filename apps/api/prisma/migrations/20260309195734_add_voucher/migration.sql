-- CreateTable
CREATE TABLE "voucher" (
    "id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "recipient_name" TEXT,
    "recipient_org" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voucher_code_key" ON "voucher"("code");

-- AddForeignKey
ALTER TABLE "voucher" ADD CONSTRAINT "voucher_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
