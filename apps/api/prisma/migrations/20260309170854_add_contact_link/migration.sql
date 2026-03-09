-- CreateTable
CREATE TABLE "contact_link" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "icon_url" TEXT,
    "updated_by_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_link_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_link" ADD CONSTRAINT "contact_link_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
