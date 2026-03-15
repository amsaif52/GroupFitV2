-- CreateTable
CREATE TABLE "trainer_additional_image" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_additional_image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trainer_additional_image" ADD CONSTRAINT "trainer_additional_image_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
