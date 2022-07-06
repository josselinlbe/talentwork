-- AlterTable
ALTER TABLE "Entity" ADD COLUMN     "defaultVisibility" TEXT NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "Row" ALTER COLUMN "visibility" DROP DEFAULT;
