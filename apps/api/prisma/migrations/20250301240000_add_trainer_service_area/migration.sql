-- CreateTable
CREATE TABLE "trainer_service_area" (
    "id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "radius_km" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_service_area_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trainer_service_area" ADD CONSTRAINT "trainer_service_area_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
