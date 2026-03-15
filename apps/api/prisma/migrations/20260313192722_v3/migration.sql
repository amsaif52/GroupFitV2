-- CreateTable
CREATE TABLE "trainer_social_link" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "facebook_id" TEXT,
    "instagram_id" TEXT,
    "tiktok_id" TEXT,
    "twitter_id" TEXT,
    "youtube_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_social_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_social_link_trainer_id_key" ON "trainer_social_link"("trainer_id");

-- AddForeignKey
ALTER TABLE "trainer_social_link" ADD CONSTRAINT "trainer_social_link_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
