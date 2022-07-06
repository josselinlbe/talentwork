-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "entityId" TEXT;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
