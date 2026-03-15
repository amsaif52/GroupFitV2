-- AlterTable
ALTER TABLE "trainer_availability" ADD COLUMN     "service_area_id" TEXT;

-- AddForeignKey
ALTER TABLE "trainer_availability" ADD CONSTRAINT "trainer_availability_service_area_id_fkey" FOREIGN KEY ("service_area_id") REFERENCES "trainer_service_area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
