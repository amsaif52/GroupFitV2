-- AddForeignKey: trainer_id on customer_favourite_trainer must reference an existing User (trainer)
ALTER TABLE "customer_favourite_trainer" ADD CONSTRAINT "customer_favourite_trainer_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
