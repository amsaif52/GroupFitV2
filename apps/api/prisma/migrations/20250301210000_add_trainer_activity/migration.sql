-- CreateTable
CREATE TABLE "trainer_activity" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "activity_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_activity_trainer_id_activity_code_key" ON "trainer_activity"("trainer_id", "activity_code");

-- AddForeignKey
ALTER TABLE "trainer_activity" ADD CONSTRAINT "trainer_activity_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
