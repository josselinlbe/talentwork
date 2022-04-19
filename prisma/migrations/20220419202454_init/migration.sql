/*
  Warnings:

  - You are about to drop the column `contactUs` on the `SubscriptionProduct` table. All the data in the column will be lost.
  - You are about to drop the column `maxStorage` on the `SubscriptionProduct` table. All the data in the column will be lost.
  - You are about to drop the column `maxTenantRelationships` on the `SubscriptionProduct` table. All the data in the column will be lost.
  - You are about to drop the column `maxStorage` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `maxTenantRelationships` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `maxUsers` on the `TenantSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyContracts` on the `TenantSubscription` table. All the data in the column will be lost.
  - Added the required column `public` to the `SubscriptionProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TenantSubscription" DROP CONSTRAINT "TenantSubscription_tenantId_fkey";

-- AlterTable
ALTER TABLE "SubscriptionProduct" DROP COLUMN "contactUs",
DROP COLUMN "maxStorage",
DROP COLUMN "maxTenantRelationships",
ADD COLUMN     "public" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "TenantSubscription" DROP COLUMN "maxStorage",
DROP COLUMN "maxTenantRelationships",
DROP COLUMN "maxUsers",
DROP COLUMN "monthlyContracts";

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
