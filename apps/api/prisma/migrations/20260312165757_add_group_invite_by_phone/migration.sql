-- CreateTable
CREATE TABLE "group_invite_by_phone" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "invited_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_invite_by_phone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_invite_by_phone_group_id_phone_key" ON "group_invite_by_phone"("group_id", "phone");

-- AddForeignKey
ALTER TABLE "group_invite_by_phone" ADD CONSTRAINT "group_invite_by_phone_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "customer_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invite_by_phone" ADD CONSTRAINT "group_invite_by_phone_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
