-- CreateTable
CREATE TABLE "trainer_session_location" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainer_session_location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_session_location_session_id_key" ON "trainer_session_location"("session_id");

-- AddForeignKey
ALTER TABLE "trainer_session_location" ADD CONSTRAINT "trainer_session_location_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
