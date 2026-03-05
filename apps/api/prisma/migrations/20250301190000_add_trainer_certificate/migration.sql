-- CreateTable
CREATE TABLE "trainer_certificate" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuing_organization" TEXT,
    "issued_at" TIMESTAMP(3),
    "credential_id" TEXT,
    "document_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_certificate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trainer_certificate" ADD CONSTRAINT "trainer_certificate_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
