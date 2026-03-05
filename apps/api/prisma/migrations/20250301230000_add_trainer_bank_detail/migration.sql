-- CreateTable
CREATE TABLE "trainer_bank_detail" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "bank_name" TEXT,
    "last4" TEXT NOT NULL,
    "routing_last4" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_bank_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_bank_detail_trainer_id_key" ON "trainer_bank_detail"("trainer_id");

-- AddForeignKey
ALTER TABLE "trainer_bank_detail" ADD CONSTRAINT "trainer_bank_detail_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
