-- CreateTable
CREATE TABLE "customer_favourite_activity" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "activity_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favourite_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_favourite_trainer" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favourite_trainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_favourite_activity_customer_id_activity_code_key" ON "customer_favourite_activity"("customer_id", "activity_code");

-- CreateIndex
CREATE UNIQUE INDEX "customer_favourite_trainer_customer_id_trainer_id_key" ON "customer_favourite_trainer"("customer_id", "trainer_id");

-- AddForeignKey
ALTER TABLE "customer_favourite_activity" ADD CONSTRAINT "customer_favourite_activity_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favourite_trainer" ADD CONSTRAINT "customer_favourite_trainer_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
